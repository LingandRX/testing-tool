/**
 * 测试数据生成器主页面
 */

import { useState, useCallback } from 'react';
import { Settings, Database, Tag } from 'lucide-react';
import { useI18n } from '@/utils/chromeI18n';
import { cn } from '@/lib/utils';
import { useGenerator } from './hooks/useGenerator';
import type { FieldConfig } from '@/types/testDataGenerator';

// 生成唯一 ID 的辅助函数
function generateId(): string {
  return `field_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

import FieldList from './components/FieldList';
import FieldEditor from './components/FieldEditor';
import GenerateOptions from './components/GenerateOptions';
import GenerateButton from './components/GenerateButton';
import DataPreview from './components/DataPreview';
import ResultPanel from './components/ResultPanel';
import ExportPanel from './components/ExportPanel';
import RuleManager from './components/RuleManager';

type TabType = 'fields' | 'rules';

export default function TestDataGeneratorPage() {
  const { t } = useI18n('testDataGenerator');
  const { isGenerating, progress, result, error, generate, cancel, clearResult } = useGenerator();

  // 字段配置
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // 生成选项
  const [count, setCount] = useState(100);
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [defaultNullRate, setDefaultNullRate] = useState(10);

  // 当前标签页
  const [activeTab, setActiveTab] = useState<TabType>('fields');

  // 添加新字段
  const handleAddField = useCallback(() => {
    const newField: FieldConfig = {
      id: generateId(),
      name: `field${fields.length + 1}`,
      generatorId: 'chineseName',
      params: {},
      required: true,
      nullRate: 0,
      unique: false,
    };
    setFields([...fields, newField]);
    setSelectedIndex(fields.length);
  }, [fields]);

  // 更新字段
  const handleUpdateField = useCallback(
    (index: number, field: FieldConfig) => {
      const newFields = [...fields];
      newFields[index] = field;
      setFields(newFields);
    },
    [fields],
  );

  // 删除字段
  const handleRemoveField = useCallback(
    (index: number) => {
      const newFields = fields.filter((_, i) => i !== index);
      setFields(newFields);
      if (selectedIndex === index) {
        setSelectedIndex(null);
      } else if (selectedIndex !== null && selectedIndex > index) {
        setSelectedIndex(selectedIndex - 1);
      }
    },
    [fields, selectedIndex],
  );

  // 加载规则
  const handleLoadRule = useCallback(
    (loadedFields: FieldConfig[]) => {
      setFields(loadedFields);
      setSelectedIndex(null);
      clearResult();
    },
    [clearResult],
  );

  // 开始生成
  const handleGenerate = useCallback(() => {
    if (fields.length === 0) return;
    generate(fields, count, format === 'csv');
  }, [fields, count, format, generate]);

  // 获取选中的字段
  const selectedField = selectedIndex !== null ? fields[selectedIndex] : null;

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">{t('testDataGenerator_title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('testDataGenerator_description')}</p>
        </div>

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
                {t('testDataGenerator_fieldConfig')}
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
                {t('testDataGenerator_ruleManagement')}
              </button>
            </div>

            {/* 字段配置标签页 */}
            {activeTab === 'fields' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 字段列表 */}
                <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
                  <FieldList
                    fields={fields}
                    onUpdate={handleUpdateField}
                    onRemove={handleRemoveField}
                    onAdd={handleAddField}
                    onSelect={setSelectedIndex}
                    selectedIndex={selectedIndex}
                  />
                </div>

                {/* 字段编辑器 */}
                <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
                  {selectedField ? (
                    <FieldEditor
                      field={selectedField}
                      onChange={(updatedField) => handleUpdateField(selectedIndex!, updatedField)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Settings className="h-10 w-10 text-muted-foreground/40 mb-3" />
                      <p className="text-sm text-muted-foreground">
                        {t('testDataGenerator_selectFieldToEdit')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 规则管理标签页 */}
            {activeTab === 'rules' && (
              <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
                <RuleManager currentFields={fields} onLoad={handleLoadRule} />
              </div>
            )}

            {/* 生成选项 */}
            <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
              <GenerateOptions
                count={count}
                onCountChange={setCount}
                format={format}
                onFormatChange={setFormat}
                defaultNullRate={defaultNullRate}
                onDefaultNullRateChange={setDefaultNullRate}
              />
            </div>

            {/* 生成按钮 */}
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
            {(result || error) && (
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

            {/* 数据预览 */}
            <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Database className="h-4 w-4" />
                {t('testDataGenerator_dataPreview')}
              </h3>
              <div className="h-[400px]">
                <DataPreview result={result} />
              </div>
            </div>

            {/* 导出面板 */}
            {result?.data && result.data.length > 0 && (
              <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
                <ExportPanel result={result} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
