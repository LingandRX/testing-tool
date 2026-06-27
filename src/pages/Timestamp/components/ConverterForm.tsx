import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  CARD_CLASS,
  INPUT_PLACEHOLDERS,
  MODE_OPTIONS,
  UNIT_OPTIONS,
  ZONES,
  type ZoneType,
} from '../constants';
import type { UseTimestampConverterReturn } from '../useTimestampConverter';

type ConverterFormProps = Omit<UseTimestampConverterReturn, 'result' | 'handleUseNow'>;

export default function ConverterForm({
  mode,
  input,
  unit,
  zone,
  error,
  setMode,
  setInput,
  setUnit,
  setZone,
}: ConverterFormProps) {
  return (
    <div className={cn(CARD_CLASS, 'gap-4')}>
      <SwitchButtonGroup value={mode} options={MODE_OPTIONS} onChange={setMode} size="small" />

      <div className="flex flex-col gap-1.5">
        <Input
          type="text"
          placeholder={INPUT_PLACEHOLDERS[mode]}
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
  );
}
