export type DiffType = 'added' | 'removed' | 'modified' | 'unchanged';
export interface DiffNode {
  /** 节点键名（对象属性名，或者数组的索引字符串 "0", "1"...） */
  key: string;

  /** 差异状态机核心分类 */
  type: DiffType;

  /** * 左侧原始数值快照
   * 💡 优化点：移除了不安全的可选 ?，如果完全缺失则严格流出 undefined，
   * 倒逼下游渲染层必须做出明确的条件分支防护。
   */
  oldValue: unknown;

  /** 右侧最新数值快照 */
  newValue: unknown;

  /** * 子节点差异列表
   * 💡 强类型化：只有当对象或数组这类容器节点发生比对时存在，未选中时默认为空数组 []
   */
  children?: DiffNode[];

  /** * 节点的绝对路径表达式（严格遵循高可靠的 JSONPath 规约，如 "$.user.profile" 或 "$.list[0]"）
   * 用于 DiffNavigator 差异导航条进行秒级的 scrollIntoView 视图精准定位高亮
   */
  path: string;

  /** 是否为叶子节点（若为 true 代表当前值为基本基元数据类型，若为 false 代表当前值为大括号或方括号容器） */
  isLeaf: boolean;

  /**
   * 💡 性能调优大闸（Computed Guard）：
   * 预计算状态：代表当前节点的深层子孙节点中，是否存在任意一处 'added' | 'removed' | 'modified' 差异行为。
   * 这使得外界的 JsonTree 在高频折叠/展开时，能在一帧之内直接通过此属性判断是否需要高亮其父大括号，
   * 彻底终结了原先命令式深度递归遍历子树的昂贵性能代价！
   */
  hasDiffInChildren: boolean;
}

/** 视图对照渲染模式：sideBySide (双栏对照折叠树) | unified (单栏行级混合拍平) */
export type ViewMode = 'sideBySide' | 'unified';

export interface DiffResult {
  /** 经过深层比对算法推导生成的根节点核心差异树（AST） */
  root: DiffNode;

  /** * 扁平化的高精度差异节点绝对路径映射表。
   * 里面严格存储了所有 type !== 'unchanged' 的节点 path。
   * 专供外部的 DiffNavigator (差异控制条) 充当中央路由索引，实现 0 延迟的上一处/下一处无缝切流。
   */
  diffPaths: string[];

  /** 差异核心总计数（等价于 diffPaths.length），注入 tabular-nums 配合渲染 */
  diffCount: number;
}

/** JSON 转换结果 */
export interface ConvertResult {
  output: string;
  originalBytes: number;
  outputBytes: number;
}

/** JSON 转换函数类型 */
export type ConvertFunction = (text: string) => ConvertResult;
