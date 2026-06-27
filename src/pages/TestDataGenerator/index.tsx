import { useState, useCallback, useRef, useEffect } from 'react';
import { Settings, Database, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useGenerator } from './hooks/useGenerator';
import FieldList, { MAX_FIELDS } from './components/FieldList';
import FieldEditor from './components/FieldEditor';
import GenerateOptions from './components/GenerateOptions';
import GenerateButton from './components/GenerateButton';
import DataPreview from './components/DataPreview';
import ResultPanel from './components/ResultPanel';
import ExportPanel from './components/ExportPanel';
import RuleManager from './components/RuleManager';
import type { FieldConfig, GenerateResult, DataRule } from '@/types/testDataGenerator';

function generateId(): string {
  return `field_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

type TabType = 'fields' | 'rules';

export default function TestDataGeneratorPage() {
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

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* 主要内容区域 - 左右分栏 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
          {/* 左侧面板 - 字段配置 */}
          <div className="lg:col-span-3 space-y-4">
            {/* 标签页切换 */}
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setActiveTab('fields')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md transition-colors',
                  activeTab === 'fields'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Settings className="h-4 w-4" />
                字段配置
              </button>
              <button
                onClick={() => setActiveTab('rules')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md transition-colors',
                  activeTab === 'rules'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Tag className="h-4 w-4" />
                规则管理
              </button>
            </div>

            {activeTab === 'fields' && (
              <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
                <FieldList
                  fields={fields}
                  onUpdate={handleUpdateField}
                  onRemove={handleRemoveField}
                  onAdd={handleAddField}
                  onEdit={handleOpenEditor}
                  onReorder={handleReorder}
                  editingRule={editingRule}
                  onRuleSaved={handleRuleSaved}
                />
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
                <RuleManager onLoad={handleLoadRule} onEdit={handleEditRule} />
              </div>
            )}

            <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
              <GenerateOptions
                count={count}
                onCountChange={setCount}
                format={format}
                onFormatChange={setFormat}
              />
            </div>

            <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
              <GenerateButton
                onClick={handleGenerate}
                onCancel={cancel}
                isGenerating={isGenerating}
                progress={progress}
                disabled={fields.length === 0}
              />
            </div>
          </div>

          {/* 右侧面板 - 数据预览和结果 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 结果状态 */}
            {/* 仅在失败或有警告时显示结果面板 */}
            {((result && !result.success) ||
              (result?.warnings && result.warnings.length > 0) ||
              error) && (
              <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
                {error ? (
                  <div className="flex items-center gap-2 text-destructive">
                    <span className="text-sm">{error}</span>
                  </div>
                ) : (
                  <ResultPanel result={result} />
                )}
              </div>
            )}

            <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Database className="h-4 w-4" />
                数据预览
              </h3>
              <div className="h-[280px]">
                <DataPreview fields={fields} />
              </div>
            </div>

            {result?.data && result.data.length > 0 && (
              <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
                <ExportPanel result={result} />
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent
          showCloseButton={false}
          className="w-[calc(100vw-2rem)] max-w-[520px] max-h-[calc(100vh-2rem)] p-0 pt-6 flex flex-col"
        >
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            {selectedField && selectedIndex !== null && (
              <FieldEditor
                field={selectedField}
                onChange={(updatedField) => handleUpdateField(selectedIndex, updatedField)}
                allFieldNames={fields.map((f) => f.name)}
              />
            )}
          </div>
          <div className="flex justify-end gap-2 px-6 py-2 border-t shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setIsEditorOpen(false)}>
              取消
            </Button>
            <Button size="sm" onClick={() => setIsEditorOpen(false)}>
              完成
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
