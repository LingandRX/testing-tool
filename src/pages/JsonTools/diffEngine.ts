import type { DiffNode, DiffResult, DiffType } from './types';

const ROOT_PATH = '$';
const SENTINEL = Symbol('missing');

type MaybeMissing = unknown | typeof SENTINEL;

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isArray = (v: unknown): v is unknown[] => Array.isArray(v);

/**
 * 健壮的 JSONPath 生成器：支持针对包含点号、空格或特殊字符的键名进行括号转义拦截
 */
const buildPath = (parent: string, key: string, isArrayChild: boolean): string => {
  if (isArrayChild) {
    return `${parent}[${key}]`;
  }
  const needsEscaping = key.includes('.') || key.includes('[') || key.includes(' ');
  const formattedKey = needsEscaping ? `["${key}"]` : `.${key}`;

  return parent === ROOT_PATH ? `${ROOT_PATH}${formattedKey}` : `${parent}${formattedKey}`;
};

const primitiveEqual = (a: unknown, b: unknown): boolean => {
  if (typeof a === 'number' && typeof b === 'number') {
    return Object.is(a, b);
  }
  return a === b;
};

const diffNode = (
  left: MaybeMissing,
  right: MaybeMissing,
  key: string,
  path: string,
  diffPaths: string[],
): DiffNode => {
  // 分支 1：节点增加行为拦截 (叶子节点状态)
  if (left === SENTINEL && right !== SENTINEL) {
    diffPaths.push(path);
    return {
      key,
      type: 'added',
      oldValue: undefined,
      newValue: right,
      path,
      isLeaf: !isObject(right) && !isArray(right),
      hasDiffInChildren: false, // 自身即是新增，子树无需向下检索
    };
  }

  // 分支 2：节点删除行为拦截 (叶子节点状态)
  if (right === SENTINEL && left !== SENTINEL) {
    diffPaths.push(path);
    return {
      key,
      type: 'removed',
      oldValue: left,
      newValue: undefined,
      path,
      isLeaf: !isObject(left) && !isArray(left),
      hasDiffInChildren: false, // 自身即是删除，子树无需向下检索
    };
  }

  const leftObj = isObject(left);
  const rightObj = isObject(right);
  const leftArr = isArray(left);
  const rightArr = isArray(right);

  // 分支 3：双对象深层递归 (容器状态)
  if (leftObj && rightObj) {
    const keySet = new Set<string>();
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);

    for (let i = 0; i < leftKeys.length; i++) keySet.add(leftKeys[i]);
    for (let i = 0; i < rightKeys.length; i++) keySet.add(rightKeys[i]);

    const children: DiffNode[] = [];
    keySet.forEach((k) => {
      const childPath = buildPath(path, k, false);
      const l: MaybeMissing = k in left ? left[k] : SENTINEL;
      const r: MaybeMissing = k in right ? right[k] : SENTINEL;
      children.push(diffNode(l, r, k, childPath, diffPaths));
    });

    const hasDiffInChildren = children.some((c) => c.type !== 'unchanged' || c.hasDiffInChildren);

    return {
      key,
      type: hasDiffInChildren ? 'modified' : 'unchanged',
      oldValue: left,
      newValue: right,
      children,
      path,
      isLeaf: false,
      hasDiffInChildren, // 完美注入预计算衍生状态
    };
  }

  // 分支 4：双数组深层按序递归 (容器状态)
  if (leftArr && rightArr) {
    const len = Math.max(left.length, right.length);
    const children: DiffNode[] = new Array(len);

    for (let i = 0; i < len; i++) {
      const k = String(i);
      const childPath = buildPath(path, k, true);
      const l: MaybeMissing = i < left.length ? left[i] : SENTINEL;
      const r: MaybeMissing = i < right.length ? right[i] : SENTINEL;
      children[i] = diffNode(l, r, k, childPath, diffPaths);
    }

    const hasDiffInChildren = children.some((c) => c.type !== 'unchanged' || c.hasDiffInChildren);

    return {
      key,
      type: hasDiffInChildren ? 'modified' : 'unchanged',
      oldValue: left,
      newValue: right,
      children,
      path,
      isLeaf: false,
      hasDiffInChildren, // 完美注入预计算衍生状态
    };
  }

  // 分支 5：绝对类型安全防护大闸 (双基本基元比对)
  const leftIsContainer = leftObj || leftArr;
  const rightIsContainer = rightObj || rightArr;

  if (!leftIsContainer && !rightIsContainer) {
    if (left === null || right === null) {
      if (left === null && right === null) {
        return {
          key,
          type: 'unchanged',
          oldValue: left,
          newValue: right,
          path,
          isLeaf: true,
          hasDiffInChildren: false,
        };
      }
    } else if (typeof left === typeof right) {
      if (primitiveEqual(left, right)) {
        return {
          key,
          type: 'unchanged',
          oldValue: left,
          newValue: right,
          path,
          isLeaf: true,
          hasDiffInChildren: false,
        };
      }
    }
  }

  // 类型完全发生突变错配，或者基本数值不相等
  diffPaths.push(path);
  return {
    key,
    type: 'modified',
    oldValue: left,
    newValue: right,
    path,
    isLeaf: !leftIsContainer && !rightIsContainer,
    hasDiffInChildren: false, // 变动在自身，后代无子树变动
  };
};

/**
 * 比较两个 JSON 值的差异，返回安全的差异树及高精度差异路径列表。
 */
export const diffJson = (left: unknown, right: unknown): DiffResult => {
  const diffPaths: string[] = [];
  const root = diffNode(left, right, '', ROOT_PATH, diffPaths);
  return {
    root,
    diffPaths,
    diffCount: diffPaths.length,
  };
};

export type { DiffNode, DiffResult, DiffType };
