import type { DiffNode, DiffResult } from '@/pages/JsonTools/types';

const ROOT_PATH = '$';
const SENTINEL = Symbol('missing');

type MaybeMissing = unknown | typeof SENTINEL;

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isArray = (v: unknown): v is unknown[] => Array.isArray(v);

/**
 * JSONPath 生成器
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

// ---------- 迭代遍历框架 ----------

interface StackFrame {
  left: MaybeMissing;
  right: MaybeMissing;
  key: string;
  path: string;
  /** 子节点数量（组装时从 resultStack 弹出） */
  childCount: number;
  /** 是否已展开 */
  assembled: boolean;
  /** 分类结果缓存 */
  leftObj: boolean;
  rightObj: boolean;
  leftArr: boolean;
  rightArr: boolean;
  leftIsContainer: boolean;
  rightIsContainer: boolean;
}

const createLeafNode = (
  key: string,
  path: string,
  type: DiffNode['type'],
  oldValue: MaybeMissing,
  newValue: MaybeMissing,
): DiffNode => ({
  key,
  type,
  oldValue: oldValue === SENTINEL ? undefined : oldValue,
  newValue: newValue === SENTINEL ? undefined : newValue,
  path,
  isLeaf: true,
  hasDiffInChildren: false,
});

const classifyPrimitive = (
  left: MaybeMissing,
  right: MaybeMissing,
  key: string,
  path: string,
): DiffNode | null => {
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
    return null;
  }
  if (typeof left === typeof right && primitiveEqual(left, right)) {
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
  return null;
};

/**
 * 合并对象 key：左全部 + 右独有的（无需 Set，O(K) in 查找）
 */
const mergedKeys = (left: Record<string, unknown>, right: Record<string, unknown>): string[] => {
  const result: string[] = Object.keys(left);
  for (const k of Object.keys(right)) {
    if (!(k in left)) result.push(k);
  }
  return result;
};

/**
 * 比较两个 JSON 值的差异（迭代版，显式栈替代递归）
 */
export const diffJson = (left: unknown, right: unknown): DiffResult => {
  const diffPaths: string[] = [];

  const rootFrame: StackFrame = {
    left,
    right,
    key: '',
    path: ROOT_PATH,
    childCount: 0,
    assembled: false,
    leftObj: isObject(left),
    rightObj: isObject(right),
    leftArr: isArray(left),
    rightArr: isArray(right),
    leftIsContainer: isObject(left) || isArray(left),
    rightIsContainer: isObject(right) || isArray(right),
  };

  const stack: StackFrame[] = [rootFrame];
  const resultStack: DiffNode[] = [];

  while (stack.length > 0) {
    const frame = stack.pop()!;

    // ---- 组装阶段：从 resultStack 弹出子节点 ----
    if (frame.assembled) {
      const { childCount } = frame;
      const children: DiffNode[] = new Array(childCount);
      // 子节点按正序压入 resultStack，弹出时逆序取
      for (let i = childCount - 1; i >= 0; i--) {
        children[i] = resultStack.pop()!;
      }

      const hasDiffInChildren = children.some((c) => c.type !== 'unchanged' || c.hasDiffInChildren);
      const type: DiffNode['type'] = hasDiffInChildren ? 'modified' : 'unchanged';

      const node: DiffNode = {
        key: frame.key,
        type,
        oldValue: frame.left === SENTINEL ? undefined : frame.left,
        newValue: frame.right === SENTINEL ? undefined : frame.right,
        children,
        path: frame.path,
        isLeaf: false,
        hasDiffInChildren,
      };
      resultStack.push(node);
      continue;
    }

    const { left: l, right: r } = frame;

    // ---- 一侧缺失 ----
    if (l === SENTINEL && r !== SENTINEL) {
      diffPaths.push(frame.path);
      resultStack.push(createLeafNode(frame.key, frame.path, 'added', undefined, r));
      continue;
    }
    if (r === SENTINEL && l !== SENTINEL) {
      diffPaths.push(frame.path);
      resultStack.push(createLeafNode(frame.key, frame.path, 'removed', l, undefined));
      continue;
    }

    // ---- 双侧对象 ----
    if (frame.leftObj && frame.rightObj) {
      const keys = mergedKeys(l as Record<string, unknown>, r as Record<string, unknown>);
      // 压入组装帧
      stack.push({ ...frame, childCount: keys.length, assembled: true });
      // 逆序压入子帧，保证正序处理
      for (let i = keys.length - 1; i >= 0; i--) {
        const k = keys[i];
        const childPath = buildPath(frame.path, k, false);
        const leftVal: MaybeMissing =
          k in (l as Record<string, unknown>) ? (l as Record<string, unknown>)[k] : SENTINEL;
        const rightVal: MaybeMissing =
          k in (r as Record<string, unknown>) ? (r as Record<string, unknown>)[k] : SENTINEL;
        stack.push({
          left: leftVal,
          right: rightVal,
          key: k,
          path: childPath,
          childCount: 0,
          assembled: false,
          leftObj: isObject(leftVal),
          rightObj: isObject(rightVal),
          leftArr: isArray(leftVal),
          rightArr: isArray(rightVal),
          leftIsContainer: isObject(leftVal) || isArray(leftVal),
          rightIsContainer: isObject(rightVal) || isArray(rightVal),
        });
      }
      continue;
    }

    // ---- 双侧数组 ----
    if (frame.leftArr && frame.rightArr) {
      const leftArr = l as unknown[];
      const rightArr = r as unknown[];
      const len = Math.max(leftArr.length, rightArr.length);

      stack.push({ ...frame, childCount: len, assembled: true });
      for (let i = len - 1; i >= 0; i--) {
        const k = String(i);
        const childPath = buildPath(frame.path, k, true);
        const leftVal: MaybeMissing = i < leftArr.length ? leftArr[i] : SENTINEL;
        const rightVal: MaybeMissing = i < rightArr.length ? rightArr[i] : SENTINEL;
        stack.push({
          left: leftVal,
          right: rightVal,
          key: k,
          path: childPath,
          childCount: 0,
          assembled: false,
          leftObj: isObject(leftVal),
          rightObj: isObject(rightVal),
          leftArr: isArray(leftVal),
          rightArr: isArray(rightVal),
          leftIsContainer: isObject(leftVal) || isArray(leftVal),
          rightIsContainer: isObject(rightVal) || isArray(rightVal),
        });
      }
      continue;
    }

    // ---- 原始值比较 ----
    if (!frame.leftIsContainer && !frame.rightIsContainer) {
      const primitiveResult = classifyPrimitive(l, r, frame.key, frame.path);
      if (primitiveResult) {
        resultStack.push(primitiveResult);
        continue;
      }
    }

    // 类型不同或容器 vs 原始值 → modified
    diffPaths.push(frame.path);
    resultStack.push({
      key: frame.key,
      type: 'modified',
      oldValue: l,
      newValue: r,
      path: frame.path,
      isLeaf: !frame.leftIsContainer && !frame.rightIsContainer,
      hasDiffInChildren: false,
    });
  }

  const root = resultStack[resultStack.length - 1];

  return {
    root,
    diffPaths,
    diffCount: diffPaths.length,
  };
};
