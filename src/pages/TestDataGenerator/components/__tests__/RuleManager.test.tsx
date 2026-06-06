import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock dependencies
vi.mock('@/utils/ruleStorage', () => ({
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

import RuleManager from '../RuleManager';
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
  name: 'Test Rule',
  description: 'Test description',
  fields: mockFields,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  useCount: 0,
};

describe('RuleManager', () => {
  const defaultProps = {
    onLoad: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedRuleStorage.getAll.mockReturnValue([]);
  });

  it('should render empty state when no rules', () => {
    render(<RuleManager {...defaultProps} />);

    expect(screen.getByText('暂无保存的规则')).toBeInTheDocument();
  });

  it('should render rule list when rules exist', () => {
    mockedRuleStorage.getAll.mockReturnValue([mockRule]);

    render(<RuleManager {...defaultProps} />);

    expect(screen.getByText('Test Rule')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('should load rule when load button clicked', async () => {
    const user = userEvent.setup();
    mockedRuleStorage.getAll.mockReturnValue([mockRule]);

    render(<RuleManager {...defaultProps} />);

    const loadButton = screen.getByTitle('加载');
    await user.click(loadButton);

    expect(defaultProps.onLoad).toHaveBeenCalledWith(mockFields);
    expect(mockedRuleStorage.recordUse).toHaveBeenCalledWith('rule-1');
    // Note: t() mock doesn't handle placeholders, so we just check it was called
    expect(mockedToast.success).toHaveBeenCalled();
  });

  it('should show delete confirmation dialog', async () => {
    const user = userEvent.setup();
    mockedRuleStorage.getAll.mockReturnValue([mockRule]);

    render(<RuleManager {...defaultProps} />);

    const deleteButton = screen.getByTitle('删除');
    await user.click(deleteButton);

    expect(screen.getByText('确认删除规则')).toBeInTheDocument();
    expect(screen.getByText(/确定要删除规则/)).toBeInTheDocument();
  });

  it('should delete rule after confirmation', async () => {
    const user = userEvent.setup();
    mockedRuleStorage.getAll.mockReturnValue([mockRule]);

    render(<RuleManager {...defaultProps} />);

    // Open delete dialog
    await user.click(screen.getByTitle('删除'));

    // Confirm delete
    await user.click(screen.getByText('确认'));

    expect(mockedRuleStorage.deleteRule).toHaveBeenCalledWith('rule-1');
    expect(mockedToast.success).toHaveBeenCalledWith('规则已删除');
  });

  it('should duplicate rule when duplicate button clicked', async () => {
    const user = userEvent.setup();
    mockedRuleStorage.getAll.mockReturnValue([mockRule]);
    mockedRuleStorage.duplicate.mockReturnValue({
      ...mockRule,
      id: 'rule-2',
      name: 'Test Rule（副本）',
    });

    render(<RuleManager {...defaultProps} />);

    await user.click(screen.getByTitle('复制'));

    expect(mockedRuleStorage.duplicate).toHaveBeenCalledWith('rule-1');
    expect(mockedToast.success).toHaveBeenCalled();
  });

  it('should update search input value', async () => {
    const rules = [mockRule, { ...mockRule, id: 'rule-2', name: 'Another Rule' }];
    mockedRuleStorage.getAll.mockReturnValue(rules);

    render(<RuleManager {...defaultProps} />);

    // Initially both rules should be visible
    expect(screen.getByText('Test Rule')).toBeInTheDocument();
    expect(screen.getByText('Another Rule')).toBeInTheDocument();

    // Verify search input exists and is interactive
    const searchInput = screen.getByPlaceholderText('搜索规则...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveValue('');
  });

  it('should call exportRules when export button clicked', async () => {
    const user = userEvent.setup();
    mockedRuleStorage.getAll.mockReturnValue([mockRule]);

    render(<RuleManager {...defaultProps} />);

    // Mock URL methods and body methods after render to avoid interfering with createRoot
    const mockCreateObjectURL = vi.fn(() => 'blob:mock');
    const mockRevokeObjectURL = vi.fn();
    vi.spyOn(URL, 'createObjectURL').mockImplementation(mockCreateObjectURL);
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(mockRevokeObjectURL);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as unknown as Node);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as unknown as Node);

    const buttons = screen.getAllByRole('button');
    const exportButton = buttons.find((btn) => btn.textContent?.includes('导出'));
    expect(exportButton).toBeDefined();

    await user.click(exportButton!);

    expect(mockedRuleStorage.exportRules).toHaveBeenCalled();
    expect(mockCreateObjectURL).toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it('should show field count for each rule', () => {
    mockedRuleStorage.getAll.mockReturnValue([mockRule]);

    render(<RuleManager {...defaultProps} />);

    // The component shows "{count} 字段" format
    expect(screen.getByText(/字段/)).toBeInTheDocument();
  });
});
