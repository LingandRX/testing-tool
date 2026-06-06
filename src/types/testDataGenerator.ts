/**
 * 测试数据生成器类型定义
 */

/**
 * 字段配置
 */
export interface FieldConfig {
  /** 字段唯一 ID */
  id: string;
  /** 字段名称 */
  name: string;
  /** 字段描述（可选） */
  description?: string;
  /** 使用的生成器 ID */
  generatorId: string;
  /** 生成器参数 */
  params: Record<string, unknown>;
  /** 是否必填 */
  required: boolean;
  /** 空值率（0-100），仅在 required=false 时生效 */
  nullRate: number;
  /** 是否唯一约束 */
  unique: boolean;
}

/**
 * 数据规则
 */
export interface DataRule {
  /** 规则唯一 ID */
  id: string;
  /** 规则名称 */
  name: string;
  /** 规则描述 */
  description?: string;
  /** 字段配置列表 */
  fields: FieldConfig[];
  /** 创建时间 */
  createdAt: number;
  /** 更新时间 */
  updatedAt: number;
  /** 最后使用时间 */
  lastUsedAt?: number;
  /** 使用次数 */
  useCount: number;
}

/**
 * 生成器参数定义
 */
export interface GeneratorParam {
  /** 参数键名 */
  key: string;
  /** 参数显示名称 */
  label: string;
  /** 参数类型 */
  type: 'string' | 'number' | 'boolean' | 'select' | 'array';
  /** 默认值 */
  defaultValue: unknown;
  /** 是否必填 */
  required?: boolean;
  /** 参数描述 */
  description?: string;
  /** 仅当 type=select 时，可选值列表 */
  options?: { label: string; value: unknown }[];
  /** 最小值（仅当 type=number 时） */
  min?: number;
  /** 最大值（仅当 type=number 时） */
  max?: number;
  /** 占位符文本（仅当 type=string 时） */
  placeholder?: string;
}

/**
 * 生成器定义
 */
export interface GeneratorDefinition {
  /** 生成器唯一 ID */
  id: string;
  /** 生成器显示名称 */
  name: string;
  /** 生成器描述 */
  description: string;
  /** 分类 ID */
  categoryId: string;
  /** 参数定义列表 */
  params: GeneratorParam[];
  /** 生成函数 */
  generate: (params: Record<string, unknown>) => string;
  /** 在指定索引生成（用于保证唯一性时的确定性生成） */
  generateAtIndex?: (params: Record<string, unknown>, index: number) => string;
}

/**
 * 生成器分类
 */
export interface GeneratorCategory {
  /** 分类 ID */
  id: string;
  /** 分类名称 */
  name: string;
  /** 分类图标 */
  icon: string;
}

/**
 * 数据生成结果
 */
export interface GenerateResult {
  /** 是否成功 */
  success: boolean;
  /** 生成的数据（JSON 格式） */
  data?: Record<string, unknown>[];
  /** 错误信息 */
  error?: string;
  /** 警告信息（如某些字段生成失败） */
  warnings?: string[];
  /** 生成统计 */
  stats?: {
    /** 总条数 */
    total: number;
    /** 成功条数 */
    success: number;
    /** 失败条数 */
    failed: number;
    /** 生成耗时（毫秒） */
    duration: number;
  };
}

/**
 * 导出文件配置
 */
export interface ExportFile {
  /** 文件名（不含扩展名） */
  filename: string;
  /** 文件内容 */
  content: string;
  /** MIME 类型 */
  mimeType: string;
}

/**
 * 生成进度信息
 */
export interface GenerateProgress {
  /** 当前进度（0-100） */
  progress: number;
  /** 已生成条数 */
  generated: number;
  /** 总条数 */
  total: number;
  /** 预计剩余时间（毫秒） */
  estimatedTimeLeft?: number;
}

/**
 * Worker 消息类型
 */
export type WorkerMessage =
  | { type: 'start'; payload: WorkerStartPayload }
  | { type: 'progress'; payload: GenerateProgress }
  | { type: 'complete'; payload: GenerateResult }
  | { type: 'error'; payload: { error: string } }
  | { type: 'cancel' };

/**
 * Worker 启动参数
 */
export interface WorkerStartPayload {
  /** 字段配置列表 */
  fields: FieldConfig[];
  /** 生成数量 */
  count: number;
  /** 是否生成 CSV 格式 */
  csvMode: boolean;
}
