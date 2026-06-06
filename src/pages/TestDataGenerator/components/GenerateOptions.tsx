/**
 * 生成选项组件
 * 配置生成数量、数据格式等选项
 */

import { useI18n } from '@/utils/chromeI18n';
import { Input } from '@/components/ui/input';

interface GenerateOptionsProps {
  count: number;
  onCountChange: (count: number) => void;
  format: 'json' | 'csv';
  onFormatChange: (format: 'json' | 'csv') => void;
  defaultNullRate: number;
  onDefaultNullRateChange: (rate: number) => void;
}

const COUNT_PRESETS = [50, 100, 1000, 5000, 10000];

const FORMAT_OPTIONS = [
  { value: 'json' as const, label: 'JSON' },
  { value: 'csv' as const, label: 'CSV' },
];

export default function GenerateOptions({
  count,
  onCountChange,
  format,
  onFormatChange,
  defaultNullRate,
  onDefaultNullRateChange,
}: GenerateOptionsProps) {
  const { t } = useI18n('testDataGenerator');

  return (
    <div className="space-y-4">
      {/* 生成数量 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {t('testDataGenerator_count')}
        </label>
        <div className="flex flex-wrap gap-2">
          {COUNT_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => onCountChange(preset)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                count === preset
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {preset.toLocaleString()}
            </button>
          ))}
        </div>
        <Input
          type="number"
          value={count}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value > 0 && value <= 100000) {
              onCountChange(value);
            }
          }}
          min={1}
          max={100000}
          className="h-9"
        />
      </div>

      {/* 数据格式 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {t('testDataGenerator_format')}
        </label>
        <div className="flex gap-2">
          {FORMAT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onFormatChange(option.value)}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                format === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 默认空值率 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            {t('testDataGenerator_defaultNullRate')}
          </label>
          <span className="text-sm text-muted-foreground">{defaultNullRate}%</span>
        </div>
        <Input
          type="number"
          value={defaultNullRate}
          onChange={(e) => onDefaultNullRateChange(Number(e.target.value))}
          min={0}
          max={50}
          step={5}
          className="h-9 w-full"
        />
      </div>
    </div>
  );
}
