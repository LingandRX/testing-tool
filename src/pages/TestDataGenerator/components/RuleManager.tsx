/**
 * 规则管理器组件
 * 管理测试数据生成规则的保存、加载、删除等操作
 */

import { useState } from 'react';
import { Search, Save, Upload, Download, Trash2, Copy, Edit, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/utils/chromeI18n';
import * as ruleStorage from '@/utils/ruleStorage';
import type { DataRule, FieldConfig } from '@/types/testDataGenerator';

interface RuleManagerProps {
  currentFields: FieldConfig[];
  onLoad: (fields: FieldConfig[]) => void;
}

export default function RuleManager({ currentFields, onLoad }: RuleManagerProps) {
  const { t } = useI18n('testDataGenerator');
  const [rules, setRules] = useState<DataRule[]>(() => ruleStorage.getAll());
  const [searchQuery, setSearchQuery] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');

  const loadRules = () => {
    setRules(ruleStorage.getAll());
  };

  const filteredRules = searchQuery ? ruleStorage.search(searchQuery) : rules;

  const handleSave = () => {
    if (!ruleName.trim()) return;

    const newRule = ruleStorage.save({
      name: ruleName.trim(),
      description: ruleDescription.trim(),
      fields: currentFields,
    });

    if (newRule) {
      loadRules();
      setShowSaveDialog(false);
      setRuleName('');
      setRuleDescription('');
    }
  };

  const handleLoad = (rule: DataRule) => {
    onLoad(rule.fields);
    ruleStorage.recordUse(rule.id);
    loadRules();
  };

  const handleDelete = (id: string) => {
    ruleStorage.deleteRule(id);
    loadRules();
  };

  const handleDuplicate = (id: string) => {
    ruleStorage.duplicate(id);
    loadRules();
  };

  const handleExport = () => {
    const json = ruleStorage.exportRules();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'test-data-rules.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      const result = ruleStorage.importRules(text);

      if (result.errors.length > 0) {
        console.warn('[RuleManager] 导入警告:', result.errors);
      }

      loadRules();
    };
    input.click();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSaveDialog(true)}
            disabled={currentFields.length === 0}
            className="h-8 gap-1.5"
          >
            <Save className="h-4 w-4" />
            {t('testDataGenerator_saveRule')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleImport} className="h-8 gap-1.5">
            <Upload className="h-4 w-4" />
            {t('testDataGenerator_import')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={rules.length === 0}
            className="h-8 gap-1.5"
          >
            <Download className="h-4 w-4" />
            {t('testDataGenerator_export')}
          </Button>
        </div>
        <span className="text-xs text-muted-foreground">
          {t('testDataGenerator_ruleCount', { count: rules.length, max: 20 })}
        </span>
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('testDataGenerator_searchRules')}
          className="pl-9 h-9"
        />
      </div>

      {/* 保存对话框 */}
      {showSaveDialog && (
        <div className="p-3 rounded-lg border bg-card space-y-3">
          <h4 className="text-sm font-medium text-foreground">
            {t('testDataGenerator_saveNewRule')}
          </h4>
          <Input
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
            placeholder={t('testDataGenerator_ruleNamePlaceholder')}
            className="h-9"
          />
          <Input
            value={ruleDescription}
            onChange={(e) => setRuleDescription(e.target.value)}
            placeholder={t('testDataGenerator_ruleDescPlaceholder')}
            className="h-9"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowSaveDialog(false)}>
              {t('testDataGenerator_cancel')}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!ruleName.trim()}>
              {t('testDataGenerator_confirm')}
            </Button>
          </div>
        </div>
      )}

      {/* 规则列表 */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredRules.length === 0 ? (
          <div className="text-center py-6">
            <Tag className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? t('testDataGenerator_noSearchResults')
                : t('testDataGenerator_noRules')}
            </p>
          </div>
        ) : (
          filteredRules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-foreground truncate">{rule.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {rule.fields.length} {t('testDataGenerator_fields')}
                  </span>
                </div>
                {rule.description && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {rule.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(rule.updatedAt)}
                  </span>
                  <span>{t('testDataGenerator_usedTimes', { count: rule.useCount })}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleLoad(rule)}
                  title={t('testDataGenerator_load')}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleDuplicate(rule.id)}
                  title={t('testDataGenerator_duplicate')}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(rule.id)}
                  title={t('testDataGenerator_delete')}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
