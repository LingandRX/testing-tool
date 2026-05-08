export type DiffType = 'added' | 'removed' | 'modified' | 'unchanged';

export interface DiffNode {
  /** 节点键名（数组项为索引字符串） */
  key: string;
  /** 差异类型 */
  type: DiffType;
  /** 左侧值 */
  oldValue?: unknown;
  /** 右侧值 */
  newValue?: unknown;
  /** 子节点（对象或数组时存在） */
  children?: DiffNode[];
  /** 完整路径，用于导航定位 */
  path: string;
  /** 是否为叶子节点（原始值） */
  isLeaf: boolean;
}

export type ViewMode = 'sideBySide' | 'unified';

export interface DiffResult {
  /** 根节点差异树 */
  root: DiffNode;
  /** 所有差异节点路径列表（用于导航） */
  diffPaths: string[];
  /** 差异总数 */
  diffCount: number;
}
