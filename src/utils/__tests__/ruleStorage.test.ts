import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as ruleStorage from '../ruleStorage';

const STORAGE_KEY = 'testDataGenerator_rules';

const mockField = {
  id: 'field-1',
  name: 'username',
  generatorId: 'string',
  params: {},
  required: true,
  nullRate: 0,
  unique: false,
};

describe('ruleStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('save 在 localStorage 写入失败时应返回 null', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });

    const result = ruleStorage.save({
      name: 'Test Rule',
      fields: [mockField],
    });

    expect(result).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('update 在 localStorage 写入失败时应返回 null', () => {
    const saved = ruleStorage.save({
      name: 'Test Rule',
      fields: [mockField],
    });
    expect(saved).not.toBeNull();

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });

    const updated = ruleStorage.update(saved!.id, { name: 'Updated Rule' });
    expect(updated).toBeNull();
  });

  it('deleteRule 在 localStorage 写入失败时应返回 false', () => {
    const saved = ruleStorage.save({
      name: 'Test Rule',
      fields: [mockField],
    });
    expect(saved).not.toBeNull();

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });

    expect(ruleStorage.deleteRule(saved!.id)).toBe(false);
    expect(ruleStorage.getById(saved!.id)).toBeDefined();
  });

  it('importRules 应能恢复导出的规则备份', () => {
    const saved = ruleStorage.save({
      name: 'Backup Rule',
      fields: [mockField],
    });
    expect(saved).not.toBeNull();

    const exported = ruleStorage.exportRules();
    ruleStorage.clear();

    const result = ruleStorage.importRules(exported);

    expect(result.success).toBe(1);
    expect(result.failed).toBe(0);
    expect(ruleStorage.getAll()).toHaveLength(1);
    expect(ruleStorage.getAll()[0].name).toBe('Backup Rule');
  });
});
