/**
 * 字段项组件
 * 展示单个字段的基本信息
 */

import { useI18n } from '@/utils/chromeI18n';
import { getGeneratorById } from '@/lib/generators';
import { Badge } from '@/components/ui/badge';
import type { FieldConfig } from '@/types/testDataGenerator';

interface FieldItemProps {
  field: FieldConfig;
  onClick: () => void;
  isSelected: boolean;
}

export default function FieldItem({ field, onClick, isSelected }: FieldItemProps) {
  const { t } = useI18n('testDataGenerator');
  const generator = getGeneratorById(field.generatorId);

  return (
    <div
      className={`flex-1 cursor-pointer p-2 rounded-md transition-colors ${
        isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm text-foreground truncate">{field.name}</span>
        <Badge variant="secondary" className="text-xs">
          {generator?.name || field.generatorId}
        </Badge>
        {!field.required && (
          <Badge variant="outline" className="text-xs text-muted-foreground">
            {field.nullRate}%
          </Badge>
        )}
        {field.unique && (
          <Badge variant="outline" className="text-xs text-blue-500">
            {t('testDataGenerator_unique')}
          </Badge>
        )}
      </div>
      {field.description && (
        <p className="text-xs text-muted-foreground mt-1 truncate">{field.description}</p>
      )}
    </div>
  );
}
