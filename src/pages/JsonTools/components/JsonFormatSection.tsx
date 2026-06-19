import { useEffect, useMemo, useState } from 'react';
import {
  formatJson,
  type JsonFormatOptions,
  type JsonFormatResult,
  validateJson,
} from '@/utils/jsonFormatter';
import EmptyPlaceholder from '@/components/EmptyPlaceholder';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import TextInputArea from '@/components/TextInputArea';
import JsonResultPanel from './JsonResultPanel';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function JsonFormatSection() {
  const [input, setInput] = useState('');
  const [debouncedInput, setDebouncedInput] = useState('');
  const [indentSize, setIndentSize] = useState<number>(2);
  const [sortKeys, setSortKeys] = useState(false);

  // Debounce input
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedInput(input);
    }, 250);
    return () => clearTimeout(handle);
  }, [input]);

  const error = useMemo(() => {
    return validateJson(debouncedInput);
  }, [debouncedInput]);

  // Real-time formatting pipeline
  const formattedPipeline = useMemo(() => {
    const trimmed = debouncedInput.trim();
    if (!trimmed || error) return null;

    try {
      const options: JsonFormatOptions = { indentSize, sortKeys };
      return formatJson(debouncedInput, options);
    } catch (e) {
      return {
        isRuntimeError: true,
        errorMessage: e instanceof SyntaxError ? e.message : String(e),
      };
    }
  }, [debouncedInput, error, indentSize, sortKeys]);

  const runtimeError =
    formattedPipeline && 'isRuntimeError' in formattedPipeline
      ? formattedPipeline.errorMessage
      : null;
  const result =
    formattedPipeline && !('isRuntimeError' in formattedPipeline)
      ? (formattedPipeline as JsonFormatResult)
      : null;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 工具控制栏 */}
      <div className="flex h-10 items-center justify-between px-1.5 bg-secondary/40 rounded-xl border border-border/60">
        <div className="flex gap-4 items-center w-full">
          {/* 缩进配置区 */}
          <div className="flex gap-2 items-center shrink-0 select-none">
            <span className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-wider">
              {'缩进'}
            </span>
            <SwitchButtonGroup
              value={indentSize}
              onChange={(v) => setIndentSize(Number(v))}
              options={[2, 4, 6, 8].map((size) => ({ value: size, label: String(size) }))}
              size="small"
            />
          </div>

          <div className="h-4 w-px bg-border/60" />

          {/* 键名排序区 */}
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
              {'键名排序'}
            </Label>
          </div>
        </div>
      </div>

      {/* 满血版输入终端 */}
      <TextInputArea
        placeholder={'输入需要格式化的 JSON...'}
        value={input}
        onChange={setInput}
        externalError={error || runtimeError || undefined}
        showClear={true}
        allowCopy={true}
        minRows={8}
        maxRows={15}
        onClear={() => setInput('')}
      />

      {/* 格式化结果流面板展示 */}
      {result && result.formatted ? (
        <JsonResultPanel
          title="格式化结果"
          content={result.formatted}
          originalBytes={result.originalBytes}
          outputBytes={result.formattedBytes}
        />
      ) : (
        <EmptyPlaceholder>
          {error ? '请修正上方 JSON 的语法错误以开启实时流式格式化' : '输入 JSON 后点击格式化'}
        </EmptyPlaceholder>
      )}
    </div>
  );
}
