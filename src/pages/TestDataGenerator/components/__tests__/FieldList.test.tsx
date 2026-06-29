import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FieldConfig } from '@/types/testDataGenerator';

vi.mock('@/utils/ruleStorage', () => ({
  getByName: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import FieldList from '../FieldList';
import * as ruleStorage from '@/utils/ruleStorage';
import { toast } from 'sonner';

const mockedRuleStorage = vi.mocked(ruleStorage);
const mockedToast = vi.mocked(toast);

const mockFields: FieldConfig[] = [
  {
    id: 'field-1',
    name: 'username',
    generatorId: 'string',
    params: {},
    required: true,
    nullRate: 0,
    unique: false,
  },
];

const defaultProps = {
  fields: mockFields,
  onUpdate: vi.fn(),
  onRemove: vi.fn(),
  onAdd: vi.fn(),
  onEdit: vi.fn(),
  onReorder: vi.fn(),
};

describe('FieldList 规则保存', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedRuleStorage.getByName.mockReturnValue(undefined);
    mockedRuleStorage.save.mockReturnValue({
      id: 'rule-1',
      name: 'My Rule',
      fields: mockFields,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      useCount: 0,
    });
  });

  it('覆盖同名规则时应更新已有规则而非新建', async () => {
    const user = userEvent.setup();
    const existingRule = {
      id: 'existing-rule-id',
      name: 'My Rule',
      fields: mockFields,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      useCount: 0,
    };

    mockedRuleStorage.getByName.mockReturnValue(existingRule);

    render(<FieldList {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /保存规则/ }));
    await user.type(screen.getByPlaceholderText('规则名称'), 'My Rule');
    await user.click(screen.getByRole('button', { name: '确认' }));

    expect(screen.getByText('已存在同名规则，是否覆盖保存？')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '覆盖' }));

    expect(mockedRuleStorage.save).toHaveBeenCalledWith({
      id: 'existing-rule-id',
      name: 'My Rule',
      description: '',
      fields: mockFields,
    });
    expect(mockedToast.success).toHaveBeenCalledWith('规则已覆盖');
  });
});
