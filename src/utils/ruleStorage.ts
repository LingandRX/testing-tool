/**
 * 规则存储工具
 * 实现测试数据生成器规则的持久化存储和管理
 */

import type { DataRule, FieldConfig } from '@/types/testDataGenerator';

/** 存储键名 */
const STORAGE_KEY = 'testDataGenerator_rules';

/** 最大规则数量 */
export const MAX_RULES = 20;

/**
 * 获取所有规则
 */
export function getAll(): DataRule[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as DataRule[];
  } catch (error) {
    console.error('[ruleStorage] 获取规则列表失败:', error);
    return [];
  }
}

/**
 * 根据 ID 获取规则
 */
export function getById(id: string): DataRule | undefined {
  const rules = getAll();
  return rules.find((rule) => rule.id === id);
}

/**
 * 根据名称获取规则
 */
export function getByName(name: string): DataRule | undefined {
  const rules = getAll();
  return rules.find((rule) => rule.name === name);
}

/**
 * 获取规则数量
 */
export function getCount(): number {
  return getAll().length;
}

/**
 * 是否达到最大数量限制
 */
export function isMaxReached(): boolean {
  return getCount() >= MAX_RULES;
}

/**
 * 保存规则（新增或更新）
 */
export function save(
  rule: Omit<DataRule, 'id' | 'createdAt' | 'updatedAt' | 'useCount'> & { id?: string },
): DataRule | null {
  const rules = getAll();
  const now = Date.now();

  // 新增规则
  if (!rule.id) {
    if (isMaxReached()) {
      console.warn('[ruleStorage] 规则数量已达上限');
      return null;
    }
    const newRule: DataRule = {
      ...rule,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      useCount: 0,
    };
    rules.unshift(newRule);
    setAll(rules);
    return newRule;
  }

  // 更新规则
  const index = rules.findIndex((r) => r.id === rule.id);
  if (index === -1) {
    console.warn('[ruleStorage] 规则不存在:', rule.id);
    return null;
  }
  const updatedRule: DataRule = {
    ...rules[index],
    ...rule,
    id: rule.id,
    updatedAt: now,
  };
  rules[index] = updatedRule;
  setAll(rules);
  return updatedRule;
}

/**
 * 更新规则
 */
export function update(id: string, updates: Partial<DataRule>): DataRule | null {
  const rules = getAll();
  const index = rules.findIndex((r) => r.id === id);
  if (index === -1) {
    console.warn('[ruleStorage] 规则不存在:', id);
    return null;
  }

  const updatedRule: DataRule = {
    ...rules[index],
    ...updates,
    id: rules[index].id, // 确保 ID 不被覆盖
    updatedAt: Date.now(),
  };
  rules[index] = updatedRule;
  setAll(rules);
  return updatedRule;
}

/**
 * 删除规则
 */
export function deleteRule(id: string): boolean {
  const rules = getAll();
  const index = rules.findIndex((r) => r.id === id);
  if (index === -1) {
    console.warn('[ruleStorage] 规则不存在:', id);
    return false;
  }
  rules.splice(index, 1);
  setAll(rules);
  return true;
}

/**
 * 复制规则
 * @param id 规则 ID
 * @param copySuffix 复制后缀，默认为中文「（副本）」，可通过 i18n 传入
 */
export function duplicate(id: string, copySuffix = '（副本）'): DataRule | null {
  const rule = getById(id);
  if (!rule) {
    console.warn('[ruleStorage] 规则不存在:', id);
    return null;
  }

  if (isMaxReached()) {
    console.warn('[ruleStorage] 规则数量已达上限');
    return null;
  }

  const now = Date.now();
  const newRule: DataRule = {
    ...rule,
    id: generateId(),
    name: `${rule.name}${copySuffix}`,
    createdAt: now,
    updatedAt: now,
    useCount: 0,
  };

  const rules = getAll();
  rules.unshift(newRule);
  setAll(rules);
  return newRule;
}

/**
 * 记录规则使用
 */
export function recordUse(id: string): void {
  const rules = getAll();
  const index = rules.findIndex((r) => r.id === id);
  if (index === -1) return;

  rules[index].useCount += 1;
  rules[index].lastUsedAt = Date.now();
  setAll(rules);
}

/**
 * 搜索规则
 */
export function search(query: string): DataRule[] {
  const rules = getAll();
  const lowerQuery = query.toLowerCase();
  return rules.filter(
    (rule) =>
      rule.name.toLowerCase().includes(lowerQuery) ||
      rule.description?.toLowerCase().includes(lowerQuery),
  );
}

/**
 * 获取最近使用的规则
 */
export function getRecent(count = 5): DataRule[] {
  const rules = getAll();
  return [...rules]
    .filter((rule) => rule.lastUsedAt)
    .sort((a, b) => (b.lastUsedAt || 0) - (a.lastUsedAt || 0))
    .slice(0, count);
}

/**
 * 导出规则（JSON 字符串）
 */
export function exportRules(ids?: string[]): string {
  const rules = getAll();
  const exportData = ids ? rules.filter((r) => ids.includes(r.id)) : rules;
  return JSON.stringify(exportData, null, 2);
}

/**
 * 导入规则
 */
export function importRules(jsonString: string): {
  success: number;
  failed: number;
  errors: string[];
} {
  const result = { success: 0, failed: 0, errors: [] as string[] };

  try {
    const data = JSON.parse(jsonString);
    if (!Array.isArray(data)) {
      result.failed = 1;
      result.errors.push('导入数据格式错误：不是数组');
      return result;
    }

    for (const item of data) {
      const validation = validateRule(item);
      if (!validation.valid) {
        result.failed++;
        result.errors.push(`规则 "${item.name || '未知'}": ${validation.error}`);
        continue;
      }

      const saved = save(item as Omit<DataRule, 'id' | 'createdAt' | 'updatedAt' | 'useCount'>);
      if (saved) {
        result.success++;
      } else {
        result.failed++;
        result.errors.push(`规则 "${item.name}" 保存失败`);
      }
    }
  } catch (error) {
    result.failed = 1;
    result.errors.push(`导入失败: ${error}`);
  }

  return result;
}

/**
 * 清空所有规则
 */
export function clear(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * 保存所有规则到存储
 */
function setAll(rules: DataRule[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  } catch (error) {
    console.error('[ruleStorage] 保存规则失败:', error);
  }
}

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return `rule_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 验证规则格式
 */
function validateRule(rule: unknown): { valid: boolean; error?: string } {
  if (!rule || typeof rule !== 'object') {
    return { valid: false, error: '规则格式无效' };
  }

  const obj = rule as Record<string, unknown>;

  if (!obj.name || typeof obj.name !== 'string') {
    return { valid: false, error: '缺少规则名称' };
  }

  if (!obj.fields || !Array.isArray(obj.fields)) {
    return { valid: false, error: '缺少字段配置' };
  }

  for (const field of obj.fields) {
    const fieldValidation = validateField(field);
    if (!fieldValidation.valid) {
      return {
        valid: false,
        error: `字段 "${(field as FieldConfig).name || '未知'}": ${fieldValidation.error}`,
      };
    }
  }

  return { valid: true };
}

/**
 * 验证字段配置
 */
function validateField(field: unknown): { valid: boolean; error?: string } {
  if (!field || typeof field !== 'object') {
    return { valid: false, error: '字段格式无效' };
  }

  const obj = field as Record<string, unknown>;

  if (!obj.name || typeof obj.name !== 'string') {
    return { valid: false, error: '缺少字段名称' };
  }

  if (!obj.generatorId || typeof obj.generatorId !== 'string') {
    return { valid: false, error: '缺少生成器 ID' };
  }

  if (typeof obj.required !== 'boolean') {
    return { valid: false, error: '缺少必填标识' };
  }

  return { valid: true };
}
