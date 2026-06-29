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

  it('save 带 id 时应更新已有规则而非新建', () => {
    const first = ruleStorage.save({
      name: 'Test Rule',
      fields: [mockField],
    });
    expect(first).not.toBeNull();

    const updatedField = { ...mockField, name: 'email' };
    const updated = ruleStorage.save({
      id: first!.id,
      name: 'Test Rule',
      description: 'Updated',
      fields: [updatedField],
    });

    expect(updated).not.toBeNull();
    expect(ruleStorage.getCount()).toBe(1);
    expect(ruleStorage.getById(first!.id)?.fields[0].name).toBe('email');
    expect(ruleStorage.getById(first!.id)?.description).toBe('Updated');
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
});
