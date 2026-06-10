/**
 * 生成器配置组件
 * 根据生成器参数定义动态渲染配置表单
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/utils/chromeI18n';
import type { GeneratorDefinition } from '@/types/testDataGenerator';

interface GeneratorConfigProps {
  generator: GeneratorDefinition;
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
}

export default function GeneratorConfig({ generator, params, onChange }: GeneratorConfigProps) {
  const { t } = useI18n('testDataGenerator');
  const handleParamChange = (key: string, value: unknown) => {
    onChange({ ...params, [key]: value });
  };

  if (generator.params.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        {t('testDataGenerator_noGeneratorParams')}
      </p>
    );
  }

  return (
    <div className="space-y-4 p-3 rounded-lg bg-muted/30">
      {generator.params.map((param) => (
        <div key={param.key} className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            {param.label}
            {param.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {param.description && (
            <p className="text-xs text-muted-foreground">{param.description}</p>
          )}

          {param.type === 'string' && (
            <Input
              value={String(params[param.key] ?? param.defaultValue)}
              onChange={(e) => handleParamChange(param.key, e.target.value)}
              placeholder={param.placeholder}
              className="h-9"
            />
          )}

          {param.type === 'number' && (
            <Input
              type="number"
              value={Number(params[param.key] ?? param.defaultValue)}
              onChange={(e) => handleParamChange(param.key, Number(e.target.value))}
              min={param.min}
              max={param.max}
              className="h-9"
            />
          )}

          {param.type === 'boolean' && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {params[param.key] !== false
                  ? t('testDataGenerator_enabled')
                  : t('testDataGenerator_disabled')}
              </span>
              <Switch
                checked={params[param.key] !== false}
                onCheckedChange={(checked) => handleParamChange(param.key, checked)}
              />
            </div>
          )}

          {param.type === 'select' && (
            <Select
              value={String(params[param.key] ?? param.defaultValue)}
              onValueChange={(value) => handleParamChange(param.key, value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {param.options?.map((option) => (
                  <SelectItem key={String(option.value)} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {param.type === 'array' && (
            <Input
              value={
                Array.isArray(params[param.key])
                  ? (params[param.key] as string[]).join(', ')
                  : String(param.defaultValue || '')
              }
              onChange={(e) =>
                handleParamChange(
                  param.key,
                  e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                )
              }
              placeholder={t('testDataGenerator_commaSeparated')}
              className="h-9"
            />
          )}
        </div>
      ))}
    </div>
  );
}
