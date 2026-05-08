import type { DiffNode, DiffResult, DiffType } from './types';

const ROOT_PATH = '$';
const SENTINEL = Symbol('missing');

type MaybeMissing = unknown | typeof SENTINEL;

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isArray = (v: unknown): v is unknown[] => Array.isArray(v);

const buildPath = (parent: string, key: string, isArrayChild: boolean): string => {
  if (parent === ROOT_PATH) {
    return isArrayChild ? `${ROOT_PATH}[${key}]` : `${ROOT_PATH}.${key}`;
  }
  return isArrayChild ? `${parent}[${key}]` : `${parent}.${key}`;
};

const primitiveEqual = (a: unknown, b: unknown): boolean => {
  // NaN handling: treat NaN === NaN as equal for diff purposes
  if (typeof a === 'number' && typeof b === 'number' && Number.isNaN(a) && Number.isNaN(b)) {
    return true;
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
  // Added: left missing, right present
  if (left === SENTINEL && right !== SENTINEL) {
    diffPaths.push(path);
    return {
      key,
      type: 'added',
      newValue: right,
      path,
      isLeaf: !isObject(right) && !isArray(right),
    };
  }

  // Removed: right missing, left present
  if (right === SENTINEL && left !== SENTINEL) {
    diffPaths.push(path);
    return {
      key,
      type: 'removed',
      oldValue: left,
      path,
      isLeaf: !isObject(left) && !isArray(left),
    };
  }

  const leftObj = isObject(left);
  const rightObj = isObject(right);
  const leftArr = isArray(left);
  const rightArr = isArray(right);

  // Both objects
  if (leftObj && rightObj) {
    const keys = Array.from(new Set([...Object.keys(left), ...Object.keys(right)]));
    const children: DiffNode[] = keys.map((k) => {
      const childPath = buildPath(path, k, false);
      const l: MaybeMissing = k in left ? left[k] : SENTINEL;
      const r: MaybeMissing = k in right ? right[k] : SENTINEL;
      return diffNode(l, r, k, childPath, diffPaths);
    });
    const allUnchanged = children.every((c) => c.type === 'unchanged');
    return {
      key,
      type: allUnchanged ? 'unchanged' : 'modified',
      oldValue: left,
      newValue: right,
      children,
      path,
      isLeaf: false,
    };
  }

  // Both arrays
  if (leftArr && rightArr) {
    const len = Math.max(left.length, right.length);
    const children: DiffNode[] = [];
    for (let i = 0; i < len; i++) {
      const k = String(i);
      const childPath = buildPath(path, k, true);
      const l: MaybeMissing = i < left.length ? left[i] : SENTINEL;
      const r: MaybeMissing = i < right.length ? right[i] : SENTINEL;
      children.push(diffNode(l, r, k, childPath, diffPaths));
    }
    const allUnchanged = children.every((c) => c.type === 'unchanged');
    return {
      key,
      type: allUnchanged ? 'unchanged' : 'modified',
      oldValue: left,
      newValue: right,
      children,
      path,
      isLeaf: false,
    };
  }

  // Type mismatch (object vs array, object vs primitive, array vs primitive, etc.)
  // or both primitives
  const leftIsContainer = leftObj || leftArr;
  const rightIsContainer = rightObj || rightArr;
  const sameKind =
    !leftIsContainer && !rightIsContainer && typeof left === typeof right && left !== null
      ? primitiveEqual(left, right)
      : left === null && right === null
        ? true
        : false;

  if (sameKind) {
    return {
      key,
      type: 'unchanged',
      oldValue: left,
      newValue: right,
      path,
      isLeaf: true,
    };
  }

  diffPaths.push(path);
  return {
    key,
    type: 'modified',
    oldValue: left,
    newValue: right,
    path,
    isLeaf: !leftIsContainer && !rightIsContainer,
  };
};

/**
 * 比较两个 JSON 值的差异，返回差异树及差异路径列表。
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
