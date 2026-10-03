import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useGenerator } from './hooks/useGenerator';
import { MAX_FIELDS } from './components/FieldList';
import type {
  FieldConfig,
  GenerateResult,
  GenerateProgress,
  DataRule,
} from '@/types/testDataGenerator';

function generateId(): string {
  return `field_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export type TabType = 'fields' | 'rules';

export interface UseTestDataGeneratorReturn {
  fields: FieldConfig[];
  selectedIndex: number | null;
  selectedField: FieldConfig | null;
  isEditorOpen: boolean;
  setIsEditorOpen: (open: boolean) => void;
  editingRule: DataRule | null;
  count: number;
  setCount: (count: number) => void;
  format: 'json' | 'csv';
  setFormat: (format: 'json' | 'csv') => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isGenerating: boolean;
  progress: GenerateProgress | null;
  result: GenerateResult | null;
  error: string | null;
  cancel: () => void;
  clearResult: () => void;
  handleAddField: () => void;
  handleUpdateField: (index: number, field: FieldConfig) => void;
  handleRemoveField: (index: number) => void;
  handleReorder: (oldIndex: number, newIndex: number) => void;
  handleLoadRule: (loadedFields: FieldConfig[]) => void;
  handleEditRule: (rule: DataRule) => void;
  handleRuleSaved: () => void;
  handleGenerate: () => void;
  handleOpenEditor: (index: number) => void;
}

export function useTestDataGenerator(): UseTestDataGeneratorReturn {
  const { isGenerating, progress, result, error, generate, cancel, clearResult } = useGenerator();

  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<DataRule | null>(null);

  const [count, setCount] = useState(100);
  const [format, setFormat] = useState<'json' | 'csv'>('json');

  const [activeTab, setActiveTab] = useState<TabType>('fields');

  const lastToastResultRef = useRef<GenerateResult | null>(null);

  useEffect(() => {
    if (result?.success && result.stats && result !== lastToastResultRef.current) {
      lastToastResultRef.current = result;
      toast.success('生成完成', {
        description: `${result.stats.total} 条数据`,
      });
    }
  }, [result]);

  const handleAddField = useCallback(() => {
    setFields((prev) => {
      if (prev.length >= MAX_FIELDS) return prev;
      const newField: FieldConfig = {
        id: generateId(),
        name: `field${prev.length + 1}`,
        generatorId: 'chineseName',
        params: {},
        required: true,
        nullRate: 0,
        unique: false,
      };
      setSelectedIndex(prev.length);
      return [...prev, newField];
    });
  }, []);

  const handleUpdateField = useCallback((index: number, field: FieldConfig) => {
    setFields((prev) => {
      const newFields = [...prev];
      newFields[index] = field;
      return newFields;
    });
  }, []);

  const handleRemoveField = useCallback((index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
    setSelectedIndex((prev) => {
      if (prev === index) return null;
      if (prev !== null && prev > index) return prev - 1;
      return prev;
    });
  }, []);

  const handleReorder = useCallback((oldIndex: number, newIndex: number) => {
    setFields((prev) => {
      const newFields = [...prev];
      const [moved] = newFields.splice(oldIndex, 1);
      newFields.splice(newIndex, 0, moved);
      return newFields;
    });
    setSelectedIndex((prev) => {
      if (prev === oldIndex) return newIndex;
      if (prev !== null) {
        if (oldIndex < prev && newIndex >= prev) return prev - 1;
        if (oldIndex > prev && newIndex <= prev) return prev + 1;
      }
      return prev;
    });
  }, []);

  const handleLoadRule = useCallback(
    (loadedFields: FieldConfig[]) => {
      setFields(loadedFields);
      setSelectedIndex(null);
      setEditingRule(null);
      clearResult();
    },
    [clearResult],
  );

  const handleEditRule = useCallback(
    (rule: DataRule) => {
      setFields(rule.fields);
      setSelectedIndex(null);
      setEditingRule(rule);
      setActiveTab('fields');
      clearResult();
      toast.success(`正在编辑规则「${rule.name}」`);
    },
    [clearResult],
  );

  // 保存规则成功后清除编辑状态
  const handleRuleSaved = useCallback(() => {
    setEditingRule(null);
  }, []);

  const handleGenerate = useCallback(() => {
    if (fields.length === 0) return;
    generate(fields, count, format === 'csv');
  }, [fields, count, format, generate]);

  const selectedField = selectedIndex !== null && selectedIndex >= 0 ? fields[selectedIndex] : null;

  const handleOpenEditor = useCallback((index: number) => {
    setSelectedIndex(index);
    setIsEditorOpen(true);
  }, []);

  return {
    fields,
    selectedIndex,
    selectedField,
    isEditorOpen,
    setIsEditorOpen,
    editingRule,
    count,
    setCount,
    format,
    setFormat,
    activeTab,
    setActiveTab,
    isGenerating,
    progress,
    result,
    error,
    cancel,
    clearResult,
    handleAddField,
    handleUpdateField,
    handleRemoveField,
    handleReorder,
    handleLoadRule,
    handleEditRule,
    handleRuleSaved,
    handleGenerate,
    handleOpenEditor,
  };
}
