/**
 * 规则管理器组件
 * 管理测试数据生成规则的加载、删除等操作
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Upload,
  Download,
  Trash2,
  Copy,
  Edit,
  Clock,
  Tag,
  Loader2,
  FolderOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import * as ruleStorage from '@/utils/ruleStorage';
import type { DataRule, FieldConfig } from '@/types/testDataGenerator';

interface RuleManagerProps {
  onLoad: (fields: FieldConfig[]) => void;
  onEdit?: (rule: DataRule) => void;
  onRulesChanged?: () => void;
}

export default function RuleManager({ onLoad, onEdit, onRulesChanged }: RuleManagerProps) {
  const [rules, setRules] = useState<DataRule[]>(() => ruleStorage.getAll());
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [ruleToDelete, setRuleToDelete] = useState<DataRule | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const loadRules = useCallback(() => {
    setRules(ruleStorage.getAll());
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredRules = useMemo(() => {
    if (!debouncedSearchQuery) return rules;
    const query = debouncedSearchQuery.toLowerCase();
    return rules.filter(
      (rule) =>
        rule.name.toLowerCase().includes(query) || rule.description?.toLowerCase().includes(query),
    );
  }, [rules, debouncedSearchQuery]);

  const handleLoad = useCallback(
    (rule: DataRule) => {
      onLoad(rule.fields);
      ruleStorage.recordUse(rule.id);
      loadRules();
      toast.success(`已加载规则「${rule.name}」`);
    },
    [onLoad, loadRules],
  );

  const handleDelete = useCallback(() => {
    if (!ruleToDelete) return;
    ruleStorage.deleteRule(ruleToDelete.id);
    loadRules();
    setRuleToDelete(null);
    toast.success('规则已删除');
    onRulesChanged?.();
  }, [ruleToDelete, loadRules, onRulesChanged]);

  const handleDuplicate = useCallback(
    (id: string) => {
      const result = ruleStorage.duplicate(id, '（副本）');
      if (result) {
        loadRules();
        toast.success('规则已复制');
        onRulesChanged?.();
      }
    },
    [loadRules, onRulesChanged],
  );

  const handleEdit = useCallback(
    (rule: DataRule) => {
      onEdit?.(rule);
    },
    [onEdit],
  );

  const handleExport = useCallback(() => {
    try {
      setIsExporting(true);
      const json = ruleStorage.exportRules();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      try {
        const link = document.createElement('a');
        link.href = url;
        link.download = 'test-data-rules.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } finally {
        URL.revokeObjectURL(url);
      }
      toast.success('规则已导出');
    } catch (error) {
      console.error('[RuleManager] 导出失败:', error);
      toast.error('导出失败');
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      try {
        setIsImporting(true);
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const text = await file.text();
        const result = ruleStorage.importRules(text);

        if (result.success > 0) {
          toast.success(`成功导入 ${result.success} 条规则`);
        }

        if (result.failed > 0) {
          toast.error(`${result.failed} 条规则导入失败`);
          console.warn('[RuleManager] 导入警告:', result.errors);
        }

        loadRules();
        onRulesChanged?.();
      } catch (error) {
        console.error('[RuleManager] 导入失败:', error);
        toast.error('规则导入失败');
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  }, [loadRules, onRulesChanged]);

  const formatDate = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  return (
    <div className="space-y-4">
      {/* 删除确认对话框 */}
      <Dialog open={!!ruleToDelete} onOpenChange={() => setRuleToDelete(null)}>
        <DialogContent
          showCloseButton={false}
          className="w-[calc(100vw-4rem)] max-w-[420px] p-0 pt-6 flex flex-col"
        >
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            <p className="text-sm text-muted-foreground">
              {ruleToDelete && `确定要删除规则「${ruleToDelete.name}」吗？此操作不可撤销。`}
            </p>
          </div>
          <div className="flex justify-end gap-2 px-6 py-2 border-t shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setRuleToDelete(null)}>
              {'取消'}
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              {'确认'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 工具栏 */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={handleImport}
          disabled={isImporting}
          className="h-8 gap-1.5"
        >
          {isImporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {'导入'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isExporting || rules.length === 0}
          className="h-8 gap-1.5"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {'导出数据'}
        </Button>
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value.slice(0, 20))}
          placeholder={'搜索规则...'}
          className="pl-9 pr-24 h-9"
          maxLength={20}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none tabular-nums">
          {`已保存 ${rules.length}/${ruleStorage.MAX_RULES} 条`}
        </span>
      </div>

      {/* 规则列表 */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredRules.length === 0 ? (
          <div className="text-center py-6">
            <Tag className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {debouncedSearchQuery ? '未找到匹配的规则' : '暂无保存的规则'}
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
                    {rule.fields.length} {'字段'}
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
                  <span>{`使用 ${rule.useCount} 次`}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleLoad(rule)}
                  title={'加载'}
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleEdit(rule)}
                  title={'编辑'}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleDuplicate(rule.id)}
                  title={'复制'}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => setRuleToDelete(rule)}
                  title={'删除'}
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
