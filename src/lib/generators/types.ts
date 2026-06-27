/**
 * 生成器内部类型定义
 * 与 testDataGenerator.ts 分离，用于生成器库内部
 */

import type { GeneratorDefinition, GeneratorCategory } from '@/types/testDataGenerator';

export type { GeneratorDefinition, GeneratorCategory };

/**
 * 生成器注册表
 */
export interface GeneratorRegistry {
  /** 分类列表 */
  categories: GeneratorCategory[];
  /** 生成器列表 */
  generators: GeneratorDefinition[];
}

/**
 * 随机数生成选项
 */
export interface RandomOptions {
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 是否包含最小值 */
  includeMin?: boolean;
  /** 是否包含最大值 */
  includeMax?: boolean;
}

/**
 * 字符集选项
 */
export interface CharsetOptions {
  /** 是否包含大写字母 */
  uppercase?: boolean;
  /** 是否包含小写字母 */
  lowercase?: boolean;
  /** 是否包含数字 */
  digits?: boolean;
  /** 是否包含特殊字符 */
  special?: boolean;
  /** 自定义字符集 */
  custom?: string;
}
