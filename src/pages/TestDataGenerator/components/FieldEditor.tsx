/**
 * 字段编辑器组件
 */

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { getGeneratorById } from '@/lib/generators';
import type { FieldConfig } from '@/types/testDataGenerator';
import GeneratorSelector from './GeneratorSelector';
import GeneratorConfig from './GeneratorConfig';

interface FieldEditorProps {
  field: FieldConfig;
  onChange: (field: FieldConfig) => void;
  allFieldNames?: string[];
}

export default function FieldEditor({ field, onChange, allFieldNames = [] }: FieldEditorProps) {
  const generator = getGeneratorById(field.generatorId);
  const [nameError, setNameError] = useState<string | null>(null);

  const validateFieldName = useCallback(
    (name: string): string | null => {
      const trimmed = name.trim();
      if (!trimmed) {
        return '字段名称不能为空';
      }
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed)) {
        return '字段名称只能包含字母、数字和下划线';
      }
      const isDuplicate = allFieldNames.some(
        (n, i) => n === trimmed && i !== allFieldNames.indexOf(field.name),
      );
      if (isDuplicate) {
        return '字段名称已存在';
      }
      return null;
    },
    [allFieldNames, field.name],
  );

  const handleNameChange = (name: string) => {
    onChange({ ...field, name });
    const error = validateFieldName(name);
    setNameError(error);
  };

  const handleDescriptionChange = (description: string) => {
    onChange({ ...field, description });
  };

  const handleRequiredChange = (required: boolean) => {
    onChange({
      ...field,
      required,
      nullRate: required ? 0 : 100,
    });
  };

  const handleNullRateChange = (nullRate: number) => {
    const clampedRate = Math.max(0, Math.min(100, nullRate));
    if (clampedRate === 0) {
      onChange({ ...field, nullRate: clampedRate, required: true });
    } else {
      onChange({ ...field, nullRate: clampedRate, required: false });
    }
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
    { label: '5%', value: 5 },
    { label: '20%', value: 20 },
    { label: '50%', value: 50 },
    { label: '75%', value: 75 },
  ];

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">{'字段名称'}</Label>
            <span className="text-xs text-muted-foreground">{field.name.length}/20</span>
          </div>
          <Input
            value={field.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder={'请输入字段名称'}
            maxLength={20}
            className={`h-9 ${nameError ? 'border-destructive' : ''}`}
          />
          {nameError && <p className="text-xs text-destructive mt-1">{nameError}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">{'字段描述'}</Label>
            <span className="text-xs text-muted-foreground">
              {(field.description || '').length}/50
            </span>
          </div>
          <Input
            value={field.description || ''}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder={'可选，添加字段说明'}
            maxLength={50}
            className="h-9"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground">{'必填'}</Label>
          <Switch checked={field.required} onCheckedChange={handleRequiredChange} />
        </div>

        {!field.required && (
          <div className="space-y-2 pl-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{'空值率'}</span>
              <Badge variant="secondary" className="text-xs">
                {field.nullRate}%
              </Badge>
            </div>
            <Input
              type="number"
              value={field.nullRate}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= 0 && value <= 100) {
                  handleNullRateChange(value);
                }
              }}
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
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
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

      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground">{'唯一性约束'}</Label>
        <Switch checked={field.unique} onCheckedChange={handleUniqueChange} />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">{'数据生成器'}</Label>
        <GeneratorSelector selectedId={field.generatorId} onChange={handleGeneratorChange} />
      </div>

      {generator && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">{'生成器参数'}</Label>
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
