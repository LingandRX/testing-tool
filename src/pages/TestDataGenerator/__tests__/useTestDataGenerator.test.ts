import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { toast } from 'sonner';
import { useTestDataGenerator } from '../useTestDataGenerator';
import type {
  DataRule,
  FieldConfig,
  GenerateResult,
  GenerateProgress,
} from '@/types/testDataGenerator';

const mockGenerate = vi.fn();
const mockCancel = vi.fn();
const mockClearResult = vi.fn();

let mockGeneratorState: {
  isGenerating: boolean;
  progress: GenerateProgress | null;
  result: GenerateResult | null;
  error: string | null;
  generate: typeof mockGenerate;
  cancel: typeof mockCancel;
  clearResult: typeof mockClearResult;
} = {
  isGenerating: false,
  progress: null,
  result: null,
  error: null,
  generate: mockGenerate,
  cancel: mockCancel,
  clearResult: mockClearResult,
};

vi.mock('../hooks/useGenerator', () => ({
  useGenerator: () => mockGeneratorState,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockedToast = vi.mocked(toast);

describe('useTestDataGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGeneratorState = {
      isGenerating: false,
      progress: null,
      result: null,
      error: null,
      generate: mockGenerate,
      cancel: mockCancel,
      clearResult: mockClearResult,
    };
  });

  it('应具有正确的初始状态', () => {
    const { result } = renderHook(() => useTestDataGenerator());

    expect(result.current.fields).toEqual([]);
    expect(result.current.selectedIndex).toBeNull();
    expect(result.current.selectedField).toBeNull();
    expect(result.current.isEditorOpen).toBe(false);
    expect(result.current.editingRule).toBeNull();
    expect(result.current.count).toBe(100);
    expect(result.current.format).toBe('json');
    expect(result.current.activeTab).toBe('fields');
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.progress).toBeNull();
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('handleAddField 应添加新字段并选中', () => {
    const { result } = renderHook(() => useTestDataGenerator());

    act(() => {
      result.current.handleAddField();
    });

    expect(result.current.fields).toHaveLength(1);
    expect(result.current.fields[0].name).toBe('field1');
    expect(result.current.fields[0].generatorId).toBe('chineseName');
    expect(result.current.selectedIndex).toBe(0);
    expect(result.current.selectedField).toEqual(result.current.fields[0]);
  });

  it('handleAddField 达到 MAX_FIELDS (40) 后不再添加', () => {
    const { result } = renderHook(() => useTestDataGenerator());

    for (let i = 0; i < 45; i++) {
      act(() => {
        result.current.handleAddField();
      });
    }

    expect(result.current.fields).toHaveLength(40);
  });

  it('handleUpdateField 应更新指定索引的字段', () => {
    const { result } = renderHook(() => useTestDataGenerator());

    act(() => {
      result.current.handleAddField();
    });

    const updatedField: FieldConfig = {
      ...result.current.fields[0],
      name: 'user_name',
      generatorId: 'name',
    };

    act(() => {
      result.current.handleUpdateField(0, updatedField);
    });

    expect(result.current.fields[0].name).toBe('user_name');
    expect(result.current.fields[0].generatorId).toBe('name');
  });

  it('handleRemoveField 应删除指定字段并更新 selectedIndex', () => {
    const { result } = renderHook(() => useTestDataGenerator());

    act(() => {
      result.current.handleAddField(); // 0
      result.current.handleAddField(); // 1
      result.current.handleAddField(); // 2
    });

    // 选中索引 1
    act(() => {
      result.current.handleOpenEditor(1);
    });
    expect(result.current.selectedIndex).toBe(1);

    // 删除索引 1，selectedIndex 应变为 null
    act(() => {
      result.current.handleRemoveField(1);
    });
    expect(result.current.fields).toHaveLength(2);
    expect(result.current.selectedIndex).toBeNull();

    // 选中索引 1（原索引 2 变成 1）
    act(() => {
      result.current.handleOpenEditor(1);
    });
    // 删除前面的索引 0，selectedIndex 应由 1 变为 0
    act(() => {
      result.current.handleRemoveField(0);
    });
    expect(result.current.selectedIndex).toBe(0);
  });

  it('handleReorder 应重新排序字段并更新 selectedIndex', () => {
    const { result } = renderHook(() => useTestDataGenerator());

    act(() => {
      result.current.handleAddField(); // field1 (0)
      result.current.handleAddField(); // field2 (1)
    });

    act(() => {
      result.current.handleOpenEditor(0);
    });

    // 将 0 移到 1
    act(() => {
      result.current.handleReorder(0, 1);
    });

    expect(result.current.fields[0].name).toBe('field2');
    expect(result.current.fields[1].name).toBe('field1');
    expect(result.current.selectedIndex).toBe(1);
  });

  it('handleLoadRule 应载入字段并清理状态', () => {
    const { result } = renderHook(() => useTestDataGenerator());

    const loadedFields: FieldConfig[] = [
      {
        id: 'f-1',
        name: 'testField',
        generatorId: 'string',
        params: {},
        required: true,
        nullRate: 0,
        unique: false,
      },
    ];

    act(() => {
      result.current.handleLoadRule(loadedFields);
    });

    expect(result.current.fields).toEqual(loadedFields);
    expect(result.current.selectedIndex).toBeNull();
    expect(result.current.editingRule).toBeNull();
    expect(mockClearResult).toHaveBeenCalled();
  });

  it('handleEditRule 应切换至 fields 标签并设置编辑规则', () => {
    const { result } = renderHook(() => useTestDataGenerator());

    const rule: DataRule = {
      id: 'rule-test',
      name: '测试规则',
      description: '描述',
      fields: [
        {
          id: 'f-1',
          name: 'email',
          generatorId: 'email',
          params: {},
          required: true,
          nullRate: 0,
          unique: false,
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      useCount: 0,
    };

    act(() => {
      result.current.setActiveTab('rules');
    });

    act(() => {
      result.current.handleEditRule(rule);
    });

    expect(result.current.fields).toEqual(rule.fields);
    expect(result.current.editingRule).toEqual(rule);
    expect(result.current.activeTab).toBe('fields');
    expect(result.current.selectedIndex).toBeNull();
    expect(mockClearResult).toHaveBeenCalled();
    expect(mockedToast.success).toHaveBeenCalledWith('正在编辑规则「测试规则」');
  });

  it('handleRuleSaved 应清除 editingRule 状态', () => {
    const { result } = renderHook(() => useTestDataGenerator());

    const rule: DataRule = {
      id: 'rule-test',
      name: '测试规则',
      description: '描述',
      fields: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      useCount: 0,
    };

    act(() => {
      result.current.handleEditRule(rule);
    });
    expect(result.current.editingRule).not.toBeNull();

    act(() => {
      result.current.handleRuleSaved();
    });
    expect(result.current.editingRule).toBeNull();
  });

  it('handleGenerate 在没有字段时不触发 generate', () => {
    const { result } = renderHook(() => useTestDataGenerator());

    act(() => {
      result.current.handleGenerate();
    });

    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it('handleGenerate 在有字段时调用 generate', () => {
    const { result } = renderHook(() => useTestDataGenerator());

    act(() => {
      result.current.handleAddField();
      result.current.setCount(50);
      result.current.setFormat('csv');
    });

    act(() => {
      result.current.handleGenerate();
    });

    expect(mockGenerate).toHaveBeenCalledWith(result.current.fields, 50, true);
  });

  it('handleOpenEditor 和 setIsEditorOpen 应控制编辑器开关', () => {
    const { result } = renderHook(() => useTestDataGenerator());

    act(() => {
      result.current.handleAddField();
    });

    act(() => {
      result.current.handleOpenEditor(0);
    });

    expect(result.current.selectedIndex).toBe(0);
    expect(result.current.isEditorOpen).toBe(true);

    act(() => {
      result.current.setIsEditorOpen(false);
    });
    expect(result.current.isEditorOpen).toBe(false);
  });

  it('生成成功后应弹出完成 toast 提示', () => {
    const { rerender } = renderHook(() => useTestDataGenerator());

    const mockResult: GenerateResult = {
      success: true,
      data: [{ field1: 'test' }],
      stats: {
        total: 10,
        success: 10,
        failed: 0,
        duration: 50,
      },
    };

    mockGeneratorState.result = mockResult;
    rerender();

    expect(mockedToast.success).toHaveBeenCalledWith('生成完成', {
      description: '10 条数据',
    });
  });
});
