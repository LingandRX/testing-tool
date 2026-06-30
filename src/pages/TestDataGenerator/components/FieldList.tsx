/**
 * 字段列表组件
 * 展示所有字段配置，支持添加、删除、拖拽排序
 * 超过 5 条时启用虚拟列表滚动
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Plus, GripVertical, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import * as ruleStorage from '@/utils/ruleStorage';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { FieldConfig, DataRule } from '@/types/testDataGenerator';
import FieldItem from './FieldItem';

/** 最大字段数量 */
export const MAX_FIELDS = 40;

/** 虚拟列表配置 */
const VISIBLE_COUNT = 5;
const ROW_HEIGHT = 60; // 卡片高度 52 + 间距 8
const ROW_GAP = 8;
const OVERSCAN = 2;
const DRAG_OVERSCAN = 10; // 拖拽时增加的预加载范围

interface FieldListProps {
  fields: FieldConfig[];
  onUpdate: (index: number, field: FieldConfig) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
  onEdit: (index: number) => void;
  onReorder: (oldIndex: number, newIndex: number) => void;
  editingRule?: DataRule | null;
  onRuleSaved?: () => void;
}

/** 可排序的字段项 */
function SortableFieldItem({
  field,
  onEdit,
  onRemove,
}: {
  field: FieldConfig;
  onEdit: () => void;
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
    height: ROW_HEIGHT - ROW_GAP, // 固定卡片高度 52px，与虚拟模式一致
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-lg border transition-all ${
        isDragging
          ? 'border-primary shadow-lg'
          : 'border-border hover:border-muted-foreground/30 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-2 h-full px-3 py-2">
        <button
          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted/50 touch-none shrink-0"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="flex-1 min-w-0">
          <FieldItem field={field} onClick={onEdit} />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
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
  onEdit,
  onReorder,
  editingRule,
  onRuleSaved,
}: FieldListProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showConfirmOverwrite, setShowConfirmOverwrite] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  // 拖拽时的滚轮滚动处理
  useEffect(() => {
    if (!activeId || !containerRef.current) return;

    const container = containerRef.current;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // 滚动容器
      const scrollAmount = e.deltaY * 0.5; // 降低滚动速度，更易控制
      const newScrollTop = Math.max(
        0,
        Math.min(
          container.scrollHeight - container.clientHeight,
          container.scrollTop + scrollAmount,
        ),
      );
      container.scrollTop = newScrollTop;
      setScrollTop(newScrollTop);
    };

    // 在 document 级别监听，使用 capture 阶段以优先处理
    document.addEventListener('wheel', handleWheel, { capture: true, passive: false });

    return () => {
      document.removeEventListener('wheel', handleWheel, { capture: true });
    };
  }, [activeId]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(oldIndex, newIndex);
    }
  };

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  const isVirtual = fields.length > VISIBLE_COUNT;
  const totalHeight = fields.length * ROW_HEIGHT;
  const fixedContainerHeight = VISIBLE_COUNT * ROW_HEIGHT;
  // 少于 5 条时高度自适应，5 条及以上固定为 5 条的高度
  const containerStyle =
    fields.length < VISIBLE_COUNT
      ? { height: 'auto' as const, overflowY: 'visible' as const }
      : { height: fixedContainerHeight, overflowY: 'auto' as const };

  // 虚拟列表：计算可见范围（拖拽时扩展预加载范围）
  const currentOverscan = activeId ? DRAG_OVERSCAN : OVERSCAN;
  const visibleStart = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - currentOverscan);
  const visibleEnd = Math.min(
    fields.length,
    Math.ceil((scrollTop + fixedContainerHeight) / ROW_HEIGHT) + currentOverscan,
  );
  const visibleFields = isVirtual ? fields.slice(visibleStart, visibleEnd) : fields;

  // 查找拖拽中的项目（用于 DragOverlay）
  const activeField = activeId ? fields.find((f) => f.id === activeId) : null;

  const isMaxReached = fields.length >= MAX_FIELDS;

  // 编辑模式下，保存时更新原规则
  const handleUpdateRule = useCallback(() => {
    if (!editingRule) return;

    const updated = ruleStorage.update(editingRule.id, {
      fields: fields,
    });

    if (updated) {
      toast.success('规则已更新');
      onRuleSaved?.();
    }
  }, [editingRule, fields, onRuleSaved]);

  // 新建规则或另存为
  const handleSave = useCallback(
    (overwrite = false) => {
      if (!ruleName.trim()) return;

      const trimmedName = ruleName.trim();
      const existingRule = ruleStorage.getByName(trimmedName);

      // 检查名称是否重复
      if (!overwrite && existingRule) {
        setShowConfirmOverwrite(true);
        return;
      }

      const savedRule = ruleStorage.save(
        overwrite && existingRule
          ? {
              id: existingRule.id,
              name: trimmedName,
              description: ruleDescription.trim(),
              fields: fields,
            }
          : {
              name: trimmedName,
              description: ruleDescription.trim(),
              fields: fields,
            },
      );

      if (savedRule) {
        setShowSaveDialog(false);
        setShowConfirmOverwrite(false);
        setRuleName('');
        setRuleDescription('');
        toast.success(overwrite ? '规则已覆盖' : '规则已保存');
        onRuleSaved?.();
      } else {
        toast.error('规则保存失败');
      }
    },
    [ruleName, ruleDescription, fields, onRuleSaved],
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">
          字段 ({fields.length}/{MAX_FIELDS})
        </h3>
        <div className="flex items-center gap-2">
          {editingRule ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUpdateRule}
                disabled={fields.length === 0}
                className="h-8 gap-1.5 px-2.5"
                title={editingRule ? `编辑中: ${editingRule.name}` : ''}
              >
                <Save className="h-3.5 w-3.5" />
                更新规则
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSaveDialog(true)}
                disabled={fields.length === 0}
                className="h-8 px-2"
              >
                另存为
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveDialog(true)}
              disabled={fields.length === 0}
              className="h-8 gap-1.5 px-2.5"
            >
              <Save className="h-3.5 w-3.5" />
              保存规则
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onAdd}
            disabled={isMaxReached}
            className="h-8 gap-1.5 px-2.5"
          >
            <Plus className="h-4 w-4" />
            添加字段
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {fields.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <GripVertical className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">暂无字段</p>
            <p className="text-xs text-muted-foreground/70 mt-1">点击上方按钮添加第一个字段</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              <div
                ref={containerRef}
                className="overflow-y-auto"
                style={containerStyle}
                onScroll={handleScroll}
              >
                {isVirtual ? (
                  /* 虚拟滚动模式 */
                  <div style={{ height: totalHeight, position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        top: visibleStart * ROW_HEIGHT,
                        left: 0,
                        right: 0,
                      }}
                    >
                      {visibleFields.map((field, vi) => {
                        const realIndex = fields.findIndex((f) => f.id === field.id);
                        const isLast = visibleStart + vi === fields.length - 1;
                        return (
                          <div
                            key={field.id}
                            style={{
                              height: ROW_HEIGHT,
                              paddingBottom: isLast ? 0 : ROW_GAP,
                            }}
                          >
                            <SortableFieldItem
                              field={field}
                              onEdit={() => onEdit(realIndex)}
                              onRemove={() => onRemove(realIndex)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* 普通模式（≤5 条） */
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <SortableFieldItem
                        key={field.id}
                        field={field}
                        onEdit={() => onEdit(index)}
                        onRemove={() => onRemove(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeField ? (
                <div className="rounded-lg border border-primary bg-background shadow-lg opacity-90">
                  <div className="flex items-center gap-2 h-full px-3 py-2">
                    <div className="p-1">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <FieldItem field={activeField} onClick={() => {}} />
                    </div>
                    <div className="h-8 w-8 shrink-0" />
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent
          showCloseButton={false}
          className="w-[calc(100vw-4rem)] max-w-[420px] p-0 pt-6 flex flex-col"
        >
          <div className="flex-1 overflow-y-auto px-6 pt-2 pb-4 space-y-4">
            <Input
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder="规则名称"
              className="h-9"
            />
            <Input
              value={ruleDescription}
              onChange={(e) => setRuleDescription(e.target.value)}
              placeholder="规则描述（可选）"
              className="h-9"
            />
          </div>
          <div className="flex justify-end gap-2 px-6 py-2 border-t shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setShowSaveDialog(false)}>
              取消
            </Button>
            <Button size="sm" onClick={() => handleSave()} disabled={!ruleName.trim()}>
              确认
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmOverwrite} onOpenChange={setShowConfirmOverwrite}>
        <DialogContent
          showCloseButton={false}
          className="w-[calc(100vw-4rem)] max-w-[420px] p-0 pt-6 flex flex-col"
        >
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            <p className="text-sm text-muted-foreground">已存在同名规则，是否覆盖保存？</p>
          </div>
          <div className="flex justify-end gap-2 px-6 py-2 border-t shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setShowConfirmOverwrite(false)}>
              取消
            </Button>
            <Button size="sm" onClick={() => handleSave(true)}>
              覆盖
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
