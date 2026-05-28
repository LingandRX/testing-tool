import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import { ZONES } from './constants';
import LiveClock from './LiveClock';
import ResultView from './ResultView';
import { useTimestampConverter } from './useTimestampConverter';
import { useI18n } from '@/utils/chromeI18n';
import { cn } from '@/lib/utils';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Index() {
  const { t } = useI18n('timestamp');

  const {
    mode,
    input,
    unit,
    zone,
    result,
    error,
    setMode,
    setInput,
    setUnit,
    setZone,
    handleUseNow,
  } = useTimestampConverter();

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
        <LiveClock unit={unit} onUseNow={handleUseNow} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-sm flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <SwitchButtonGroup
                value={mode}
                options={[
                  { value: 'ts2dt', label: t('timestamp:tsToDate') },
                  { value: 'dt2ts', label: t('timestamp:dateToTs') },
                ]}
                onChange={(newMode) => setMode(newMode as 'ts2dt' | 'dt2ts')}
                size="small"
              />

              <div className="flex flex-col gap-1.5">
                <Input
                  type="text"
                  placeholder={
                    mode === 'ts2dt' ? t('timestamp:placeholderTs') : t('timestamp:placeholderDate')
                  }
                  value={input}
                  onChange={(e: { target: { value: string } }) => setInput(e.target.value)}
                  className={cn(
                    'font-mono font-semibold h-10 shadow-sm placeholder:text-muted-foreground/60 focus:bg-background',
                    error && 'border-destructive focus-visible:ring-destructive',
                  )}
                />

                {error && <p className="text-destructive text-xs font-medium px-0.5">{error}</p>}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full">
                <SwitchButtonGroup
                  value={unit}
                  options={[
                    { value: 'ms', label: t('timestamp:unitMs') },
                    { value: 's', label: t('timestamp:unitS') },
                  ]}
                  onChange={(v) => setUnit(v as 'ms' | 's')}
                  size="small"
                  className="sm:w-auto shrink-0"
                />

                <Select value={zone} onValueChange={(v: string) => setZone(v as typeof zone)}>
                  <SelectTrigger className="flex-1 font-mono font-semibold h-9 shadow-sm bg-background">
                    <SelectValue placeholder="选择时区" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64 font-mono">
                    {ZONES.map((z) => (
                      <SelectItem
                        key={z}
                        value={z}
                        className="text-xs font-semibold focus:bg-accent cursor-pointer"
                      >
                        {z}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-sm h-full flex flex-col">
            <ResultView result={result} mode={mode} unit={unit} zone={zone} showEmptyPlaceholder />
          </div>
        </div>
      </div>
    </div>
  );
}
