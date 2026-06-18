import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import { ZONES } from './constants';
import type { ModeType, UnitType, ZoneType } from './constants';
import LiveClock from './components/LiveClock';
import ResultView from './components/ResultView';
import { useTimestampConverter } from './useTimestampConverter';
import { cn } from '@/lib/utils';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MODE_OPTIONS: { value: ModeType; label: string }[] = [
  { value: 'ts2dt', label: '时间戳转日期' },
  { value: 'dt2ts', label: '日期转时间戳' },
];

const UNIT_OPTIONS: { value: UnitType; label: string }[] = [
  { value: 'ms', label: '毫秒' },
  { value: 's', label: '秒' },
];

export default function Index() {
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
                options={MODE_OPTIONS}
                onChange={setMode}
                size="small"
              />

              <div className="flex flex-col gap-1.5">
                <Input
                  type="text"
                  placeholder={mode === 'ts2dt' ? '输入时间戳...' : 'YYYY-MM-DD HH:mm:ss'}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
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
                  options={UNIT_OPTIONS}
                  onChange={setUnit}
                  size="small"
                  className="sm:w-auto shrink-0"
                />

                <Select value={zone} onValueChange={(v: string) => setZone(v as ZoneType)}>
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
            <ResultView result={result} showEmptyPlaceholder />
          </div>
        </div>
      </div>
    </div>
  );
}
