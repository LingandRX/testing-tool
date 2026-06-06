/**
 * 字段列表组件
 * 展示所有字段配置，支持添加、删除、拖拽排序
 */

import { Plus, GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/utils/chromeI18n';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { FieldConfig } from '@/types/testDataGenerator';
import FieldItem from './FieldItem';

interface FieldListProps {
  fields: FieldConfig[];
  onUpdate: (index: number, field: FieldConfig) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
  onSelect: (index: number) => void;
  selectedIndex: number | null;
  onReorder: (oldIndex: number, newIndex: number) => void;
}

/** 可排序的字段项 */
function SortableFieldItem({
  field,
  isSelected,
  onSelect,
  onRemove,
}: {
  field: FieldConfig;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-lg border transition-colors ${
        isDragging ? 'border-primary shadow-lg' : ''
      } ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-muted-foreground/30'
      }`}
    >
      <div className="flex items-center gap-2 p-3">
        {/* 拖拽手柄 */}
        <button
          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted/50 touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        <FieldItem field={field} onClick={onSelect} isSelected={isSelected} />

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function FieldList({
  fields,
  onUpdate: _onUpdate,
  onRemove,
  onAdd,
  onSelect,
  selectedIndex,
  onReorder,
}: FieldListProps) {
  const { t } = useI18n('testDataGenerator');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(oldIndex, newIndex);
    }
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              {fields.map((field, index) => (
                <SortableFieldItem
                  key={field.id}
                  field={field}
                  isSelected={selectedIndex === index}
                  onSelect={() => onSelect(index)}
                  onRemove={() => onRemove(index)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
