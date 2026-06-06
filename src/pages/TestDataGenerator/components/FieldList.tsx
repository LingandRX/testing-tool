/**
 * 字段列表组件
 * 展示所有字段配置，支持添加、删除、排序
 */

import { Plus, GripVertical, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/utils/chromeI18n';
import type { FieldConfig } from '@/types/testDataGenerator';
import FieldItem from './FieldItem';

interface FieldListProps {
  fields: FieldConfig[];
  onUpdate: (index: number, field: FieldConfig) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
  onSelect: (index: number) => void;
  selectedIndex: number | null;
}

export default function FieldList({
  fields,
  onUpdate,
  onRemove,
  onAdd,
  onSelect,
  selectedIndex,
}: FieldListProps) {
  const { t } = useI18n('testDataGenerator');

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newFields = [...fields];
    [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
    onUpdate(index - 1, newFields[index - 1]);
    onUpdate(index, newFields[index]);
  };

  const handleMoveDown = (index: number) => {
    if (index === fields.length - 1) return;
    const newFields = [...fields];
    [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    onUpdate(index, newFields[index]);
    onUpdate(index + 1, newFields[index + 1]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">
          {t('testDataGenerator_fields')} ({fields.length})
        </h3>
        <Button variant="outline" size="sm" onClick={onAdd} className="h-8 gap-1.5">
          <Plus className="h-4 w-4" />
          {t('testDataGenerator_addField')}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {fields.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <GripVertical className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">{t('testDataGenerator_noFields')}</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {t('testDataGenerator_addFieldHint')}
            </p>
          </div>
        ) : (
          fields.map((field, index) => (
            <div
              key={field.id}
              className={`group relative rounded-lg border transition-colors ${
                selectedIndex === index
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/30'
              }`}
            >
              <div className="flex items-center gap-2 p-3">
                <div className="flex flex-col gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === fields.length - 1}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>

                <FieldItem
                  field={field}
                  onClick={() => onSelect(index)}
                  isSelected={selectedIndex === index}
                />

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                  onClick={() => onRemove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
