import { Settings, Database, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTestDataGenerator } from './useTestDataGenerator';
import FieldList from './components/FieldList';
import FieldEditor from './components/FieldEditor';
import GenerateOptions from './components/GenerateOptions';
import GenerateButton from './components/GenerateButton';
import DataPreview from './components/DataPreview';
import ResultPanel from './components/ResultPanel';
import ExportPanel from './components/ExportPanel';
import RuleManager from './components/RuleManager';

const TABS = [
  { id: 'fields', label: '字段配置', Icon: Settings },
  { id: 'rules', label: '规则管理', Icon: Tag },
] as const;

export default function Index() {
  const vm = useTestDataGenerator();
  const showResult = Boolean(
    (vm.result && !vm.result.success) || vm.result?.warnings?.length || vm.error,
  );

  return (
    <div className="p-4 w-full flex flex-col space-y-4 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => vm.setActiveTab(id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md transition-colors',
                  vm.activeTab === id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {vm.activeTab === 'fields' && (
            <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
              <FieldList
                fields={vm.fields}
                onUpdate={vm.handleUpdateField}
                onRemove={vm.handleRemoveField}
                onAdd={vm.handleAddField}
                onEdit={vm.handleOpenEditor}
                onReorder={vm.handleReorder}
                editingRule={vm.editingRule}
                onRuleSaved={vm.handleRuleSaved}
              />
            </div>
          )}

          {vm.activeTab === 'rules' && (
            <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
              <RuleManager onLoad={vm.handleLoadRule} onEdit={vm.handleEditRule} />
            </div>
          )}

          <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
            <GenerateOptions
              count={vm.count}
              onCountChange={vm.setCount}
              format={vm.format}
              onFormatChange={vm.setFormat}
            />
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
            <GenerateButton
              onClick={vm.handleGenerate}
              onCancel={vm.cancel}
              isGenerating={vm.isGenerating}
              progress={vm.progress}
              disabled={vm.fields.length === 0}
            />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {showResult && (
            <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
              {vm.error ? (
                <div className="flex items-center gap-2 text-destructive">
                  <span className="text-sm">{vm.error}</span>
                </div>
              ) : (
                <ResultPanel result={vm.result} />
              )}
            </div>
          )}

          <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
            <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Database className="h-4 w-4" />
              数据预览
            </h3>
            <div className="h-[280px]">
              <DataPreview fields={vm.fields} />
            </div>
          </div>

          {vm.result?.data && vm.result.data.length > 0 && (
            <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
              <ExportPanel result={vm.result} />
            </div>
          )}
        </div>
      </div>

      <Dialog open={vm.isEditorOpen} onOpenChange={vm.setIsEditorOpen}>
        <DialogContent
          showCloseButton={false}
          className="w-[calc(100vw-2rem)] max-w-[520px] max-h-[calc(100vh-2rem)] p-0 pt-6 flex flex-col"
        >
          <DialogTitle className="sr-only">编辑字段</DialogTitle>
          <DialogDescription className="sr-only">配置字段生成规则与参数</DialogDescription>
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            {vm.selectedField && vm.selectedIndex !== null && (
              <FieldEditor
                field={vm.selectedField}
                onChange={(f) => vm.handleUpdateField(vm.selectedIndex!, f)}
                allFieldNames={vm.fields.map((f) => f.name)}
              />
            )}
          </div>
          <div className="flex justify-end gap-2 px-6 py-2 border-t shrink-0">
            <Button variant="ghost" size="sm" onClick={() => vm.setIsEditorOpen(false)}>
              取消
            </Button>
            <Button size="sm" onClick={() => vm.setIsEditorOpen(false)}>
              完成
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
