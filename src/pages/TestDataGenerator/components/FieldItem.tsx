/**
 * 字段项组件
 * 展示单个字段的基本信息，适配固定高度卡片
 */

import { getGeneratorById } from '@/lib/generators';
import { Badge } from '@/components/ui/badge';
import type { FieldConfig } from '@/types/testDataGenerator';

interface FieldItemProps {
  field: FieldConfig;
  onClick: () => void;
}

export default function FieldItem({ field, onClick }: FieldItemProps) {
  const generator = getGeneratorById(field.generatorId);

  return (
    <div
      className="flex-1 min-w-0 cursor-pointer rounded-md transition-all hover:bg-muted/50"
      onClick={onClick}
    >
      <div
        className={`h-full ${field.description ? 'flex flex-col justify-center' : 'flex items-center'}`}
      >
        {/* 第一行：字段名 + 标签 */}
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="font-medium text-sm text-foreground truncate shrink-0 max-w-[140px]">
            {field.name}
          </span>
          <Badge variant="secondary" className="text-[10px] shrink-0 px-1 py-0">
            {generator?.name || field.generatorId}
          </Badge>
          {!field.required && (
            <Badge
              variant="outline"
              className="text-[10px] shrink-0 px-1 py-0 text-muted-foreground"
            >
              {field.nullRate}%
            </Badge>
          )}
          {field.unique && (
            <Badge variant="outline" className="text-[10px] shrink-0 px-1 py-0 text-blue-500">
              {'唯一'}
            </Badge>
          )}
        </div>
        {/* 第二行：描述 */}
        {field.description && (
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate leading-tight">
            {field.description}
          </p>
        )}
      </div>
    </div>
  );
}
