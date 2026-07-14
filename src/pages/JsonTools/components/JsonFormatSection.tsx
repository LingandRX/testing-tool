import { useEffect, useMemo, useState } from 'react';
import {
  formatJson,
  type JsonFormatOptions,
  type JsonFormatResult,
  validateJson,
} from '@/utils/jsonFormatter';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import TextInputArea from '@/components/TextInputArea';
import CollapsiblePanel from './CollapsiblePanel';
import JsonResultPanel from './JsonResultPanel';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { buildPreview } from '../useJsonTools';

export default function JsonFormatSection() {
  const [input, setInput] = useState('');
  const [debouncedInput, setDebouncedInput] = useState('');
  const [indentSize, setIndentSize] = useState<number>(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [inputCollapsed, setInputCollapsed] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedInput(input);
    }, 250);
    return () => clearTimeout(handle);
  }, [input]);

  const error = useMemo(() => {
    return validateJson(debouncedInput);
  }, [debouncedInput]);

  const { result, runtimeError } = useMemo((): {
    result: JsonFormatResult | null;
    runtimeError: string | null;
  } => {
    const trimmed = debouncedInput.trim();
    if (!trimmed || error) return { result: null, runtimeError: null };

    try {
      const options: JsonFormatOptions = { indentSize, sortKeys };
      return { result: formatJson(debouncedInput, options), runtimeError: null };
    } catch (e) {
      return {
        result: null,
        runtimeError: e instanceof SyntaxError ? e.message : String(e),
      };
    }
  }, [debouncedInput, error, indentSize, sortKeys]);

  const preview = useMemo(() => buildPreview(input), [input]);

  return (
    <div className="w-full flex flex-1 min-h-0 flex-col gap-3">
      <div className="flex h-10 items-center justify-between px-1.5 bg-secondary/40 rounded-xl border border-border/60 shrink-0">
        <div className="flex gap-4 items-center w-full">
          <div className="flex gap-2 items-center shrink-0 select-none">
            <span className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-wider">
              缩进
            </span>
            <SwitchButtonGroup
              value={indentSize}
              onChange={(v: number) => setIndentSize(Number(v))}
              options={[2, 4, 6, 8].map((size) => ({ value: size, label: String(size) }))}
              size="small"
            />
          </div>

          <div className="h-4 w-px bg-border/60" />

          <div
            onClick={() => setSortKeys(!sortKeys)}
            className="flex items-center gap-2 cursor-pointer select-none group py-1"
          >
            <Checkbox
              id="sort-keys-checkbox"
              checked={sortKeys}
              onClick={(e) => e.stopPropagation()}
              onCheckedChange={(checked) => setSortKeys(checked === true)}
              className="h-3.5 w-3.5 rounded border-input data-[state=checked]:bg-primary shadow-sm"
            />
            <Label
              htmlFor="sort-keys-checkbox"
              className="text-xs font-bold text-foreground/80 cursor-pointer tracking-tight group-hover:text-foreground"
            >
              键名排序
            </Label>
          </div>
        </div>
      </div>

      <CollapsiblePanel
        title="JSON 输入"
        collapsed={inputCollapsed}
        onToggleCollapse={() => setInputCollapsed((v) => !v)}
        preview={preview}
      >
        <TextInputArea
          fill
          borderless
          placeholder="输入需要格式化的 JSON..."
          value={input}
          onChange={setInput}
          externalError={error || runtimeError || undefined}
          showClear={true}
          allowCopy={true}
          className="min-h-0 flex-1"
          onClear={() => setInput('')}
        />
      </CollapsiblePanel>

      {result?.formatted && (
        <div className="flex min-h-0 flex-1">
          <JsonResultPanel
            fill
            title="格式化结果"
            content={result.formatted}
            originalBytes={result.originalBytes}
            outputBytes={result.formattedBytes}
          />
        </div>
      )}
    </div>
  );
}
