import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../hooks/useGenerator', () => ({
  useGenerator: () => ({
    isGenerating: false,
    progress: null,
    result: null,
    error: null,
    generate: vi.fn(),
    cancel: vi.fn(),
    clearResult: vi.fn(),
  }),
}));

vi.mock('@/utils/ruleStorage', () => ({
  MAX_RULES: 20,
  getAll: vi.fn(() => []),
  save: vi.fn(),
  deleteRule: vi.fn(),
  duplicate: vi.fn(),
  recordUse: vi.fn(),
  search: vi.fn(() => []),
  exportRules: vi.fn(() => '[]'),
  importRules: vi.fn(() => ({ success: 0, failed: 0, errors: [] })),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import TestDataGeneratorPage from '../index';
import * as ruleStorage from '@/utils/ruleStorage';
import { toast } from 'sonner';
import type { DataRule, FieldConfig } from '@/types/testDataGenerator';

const mockedRuleStorage = vi.mocked(ruleStorage);
const mockedToast = vi.mocked(toast);

const mockFields: FieldConfig[] = [
  {
    id: 'field-1',
    name: 'name',
    generatorId: 'string',
    params: {},
    required: true,
    nullRate: 0,
    unique: false,
  },
];

const mockRule: DataRule = {
  id: 'rule-1',
  name: '用户数据规则',
  description: '测试规则',
  fields: mockFields,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  useCount: 0,
};

describe('TestDataGeneratorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedRuleStorage.getAll.mockReturnValue([mockRule]);
  });

  it('编辑规则时应显示包含规则名的 toast', async () => {
    const user = userEvent.setup();
    render(<TestDataGeneratorPage />);

    await user.click(screen.getByText('规则管理'));
    await user.click(screen.getByTitle('编辑'));

    expect(mockedToast.success).toHaveBeenCalledWith('正在编辑规则「用户数据规则」');
    expect(mockedToast.success).not.toHaveBeenCalledWith(expect.stringContaining('{{name}}'));
  });
});
