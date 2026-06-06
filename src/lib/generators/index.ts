/**
 * 生成器库索引
 * 导出所有生成器和分类配置
 */

import type { GeneratorDefinition, GeneratorCategory } from '@/types/testDataGenerator';
import { personalGenerators } from './personal';
import { businessGenerators } from './business';
import { technicalGenerators } from './technical';
import { basicGenerators } from './basic';

/**
 * 生成器分类配置
 */
export const generatorCategories: GeneratorCategory[] = [
  { id: 'personal', name: '个人信息', icon: 'User' },
  { id: 'business', name: '业务数据', icon: 'Briefcase' },
  { id: 'technical', name: '技术数据', icon: 'Code' },
  { id: 'basic', name: '基础类型', icon: 'Hash' },
];

/**
 * 所有生成器列表
 */
export const allGenerators: GeneratorDefinition[] = [
  ...personalGenerators,
  ...businessGenerators,
  ...technicalGenerators,
  ...basicGenerators,
];

/**
 * 根据 ID 获取生成器
 */
export function getGeneratorById(id: string): GeneratorDefinition | undefined {
  return allGenerators.find((g) => g.id === id);
}

/**
 * 根据分类 ID 获取生成器列表
 */
export function getGeneratorsByCategory(categoryId: string): GeneratorDefinition[] {
  return allGenerators.filter((g) => g.categoryId === categoryId);
}

/**
 * 搜索生成器
 */
export function searchGenerators(query: string): GeneratorDefinition[] {
  const lowerQuery = query.toLowerCase();
  return allGenerators.filter(
    (g) =>
      g.name.toLowerCase().includes(lowerQuery) ||
      g.description.toLowerCase().includes(lowerQuery) ||
      g.id.toLowerCase().includes(lowerQuery),
  );
}
