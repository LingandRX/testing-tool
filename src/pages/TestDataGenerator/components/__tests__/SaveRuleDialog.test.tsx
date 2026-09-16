import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SaveRuleDialog from '../SaveRuleDialog';
import * as ruleStorage from '@/utils/ruleStorage';
import { toast } from 'sonner';
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

const mockedRuleStorage = vi.mocked(ruleStorage);
const mockedToast = vi.mocked(toast);

const mockFields: FieldConfig[] = [
  {
    id: 'f-1',
    name: 'username',
    generatorId: 'string',
    params: {},
    required: true,
    nullRate: 0,
    unique: false,
  },
];

describe('SaveRuleDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedRuleStorage.getByName.mockReturnValue(undefined);
    mockedRuleStorage.save.mockReturnValue({
      id: 'rule-new',
      name: '新规则',
      fields: mockFields,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      useCount: 0,
    });
  });

  it('成功保存新规则并触发回调', async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();
    const handleSaved = vi.fn();

    render(
      <SaveRuleDialog
        open={true}
        onOpenChange={handleOpenChange}
        fields={mockFields}
        onSaved={handleSaved}
      />,
    );

    const nameInput = screen.getByPlaceholderText('规则名称');
    const descInput = screen.getByPlaceholderText('规则描述（可选）');

    await user.type(nameInput, '新规则');
    await user.type(descInput, '描述说明');

    await user.click(screen.getByRole('button', { name: '确认' }));

    expect(mockedRuleStorage.save).toHaveBeenCalledWith({
      name: '新规则',
      description: '描述说明',
      fields: mockFields,
    });
    expect(mockedToast.success).toHaveBeenCalledWith('规则已保存');
    expect(handleOpenChange).toHaveBeenCalledWith(false);
    expect(handleSaved).toHaveBeenCalled();
  });

  it('点击取消按钮应关闭弹窗', async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();

    render(<SaveRuleDialog open={true} onOpenChange={handleOpenChange} fields={mockFields} />);

    await user.click(screen.getByRole('button', { name: '取消' }));
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});
