/**
 * 字段编辑器组件
 * 编辑单个字段的详细配置
 */

import { useI18n } from '@/utils/chromeI18n';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { getGeneratorById } from '@/lib/generators';
import type { FieldConfig } from '@/types/testDataGenerator';
import GeneratorSelector from './GeneratorSelector';
import GeneratorConfig from './GeneratorConfig';

interface FieldEditorProps {
  field: FieldConfig;
  onChange: (field: FieldConfig) => void;
}

export default function FieldEditor({ field, onChange }: FieldEditorProps) {
  const { t } = useI18n('testDataGenerator');
  const generator = getGeneratorById(field.generatorId);

  const handleNameChange = (name: string) => {
    onChange({ ...field, name });
  };

  const handleDescriptionChange = (description: string) => {
    onChange({ ...field, description });
  };

  const handleRequiredChange = (required: boolean) => {
    onChange({
      ...field,
      required,
      nullRate: required ? 0 : field.nullRate,
    });
  };

  const handleNullRateChange = (nullRate: number) => {
    onChange({ ...field, nullRate });
  };

  const handleUniqueChange = (unique: boolean) => {
    onChange({ ...field, unique });
  };

  const handleGeneratorChange = (generatorId: string) => {
    const generator = getGeneratorById(generatorId);
    const defaultParams: Record<string, unknown> = {};
    generator?.params.forEach((p) => {
      defaultParams[p.key] = p.defaultValue;
    });
    onChange({
      ...field,
      generatorId,
      params: defaultParams,
    });
  };

  const handleParamsChange = (params: Record<string, unknown>) => {
    onChange({ ...field, params });
  };

  const nullRatePresets = [
    { label: t('testDataGenerator_nullRateLow'), value: 5 },
    { label: t('testDataGenerator_nullRateMedium'), value: 20 },
    { label: t('testDataGenerator_nullRateHigh'), value: 50 },
  ];

  return (
    <div className="space-y-5">
      {/* 基础配置 */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t('testDataGenerator_fieldName')}
          </label>
          <Input
            value={field.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder={t('testDataGenerator_fieldNamePlaceholder')}
            className="h-9"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t('testDataGenerator_fieldDescription')}
          </label>
          <Input
            value={field.description || ''}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder={t('testDataGenerator_fieldDescriptionPlaceholder')}
            className="h-9"
          />
        </div>
      </div>

      {/* 必填/选填配置 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            {t('testDataGenerator_required')}
          </label>
          <Switch checked={field.required} onCheckedChange={handleRequiredChange} />
        </div>

        {!field.required && (
          <div className="space-y-2 pl-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t('testDataGenerator_nullRate')}
              </span>
              <Badge variant="secondary" className="text-xs">
                {field.nullRate}%
              </Badge>
            </div>
            <Input
              type="number"
              value={field.nullRate}
              onChange={(e) => handleNullRateChange(Number(e.target.value))}
              min={0}
              max={100}
              step={5}
              className="h-9 w-full"
            />
            <div className="flex gap-2">
              {nullRatePresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handleNullRateChange(preset.value)}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    field.nullRate === preset.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 唯一性约束 */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          {t('testDataGenerator_uniqueConstraint')}
        </label>
        <Switch checked={field.unique} onCheckedChange={handleUniqueChange} />
      </div>

      {/* 生成器选择 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {t('testDataGenerator_generator')}
        </label>
        <GeneratorSelector selectedId={field.generatorId} onChange={handleGeneratorChange} />
      </div>

      {/* 生成器参数配置 */}
      {generator && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t('testDataGenerator_generatorParams')}
          </label>
          <GeneratorConfig
            generator={generator}
            params={field.params}
            onChange={handleParamsChange}
          />
        </div>
      )}
    </div>
  );
}
