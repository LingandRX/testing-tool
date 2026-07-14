import React, { useEffect, useMemo, useState } from 'react';
import TextInputArea from '@/components/TextInputArea';
import JsonResultPanel from './JsonResultPanel';
import CollapsiblePanel from './CollapsiblePanel';
import { validateJson } from '@/utils/jsonFormatter';
import { cn } from '@/lib/utils';
import { buildPreview } from '../useJsonTools';
import type { ConvertFunction, ConvertResult } from '../types';

const CONVERT_LABELS: Record<string, { inputPlaceholder: string; outputLabel: string }> = {
  yaml: {
    inputPlaceholder: '输入需要转换的 JSON...',
    outputLabel: 'YAML 结果',
  },
  toml: {
    inputPlaceholder: '输入需要转换的 JSON...',
    outputLabel: 'TOML 结果',
  },
  minify: {
    inputPlaceholder: '输入需要压缩的 JSON...',
    outputLabel: '压缩结果',
  },
};

interface JsonConvertSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  mode: string;
  convertFunction: ConvertFunction;
}

export default function JsonConvertSection({
  mode,
  convertFunction,
  className,
  ...props
}: JsonConvertSectionProps) {
  const [input, setInput] = useState('');
  const [debouncedInput, setDebouncedInput] = useState('');
  const [inputCollapsed, setInputCollapsed] = useState(false);

  const labels = CONVERT_LABELS[mode] ?? CONVERT_LABELS.yaml;

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
    result: ConvertResult | null;
    runtimeError: string | null;
  } => {
    const trimmed = debouncedInput.trim();
    if (!trimmed || error) return { result: null, runtimeError: null };

    try {
      return { result: convertFunction(debouncedInput), runtimeError: null };
    } catch (e) {
      return {
        result: null,
        runtimeError: e instanceof Error ? e.message : String(e),
      };
    }
  }, [debouncedInput, error, convertFunction]);

  const preview = useMemo(() => buildPreview(input), [input]);

  return (
    <div className={cn('w-full flex flex-1 min-h-0 flex-col gap-3', className)} {...props}>
      <CollapsiblePanel
        title="JSON 输入"
        collapsed={inputCollapsed}
        onToggleCollapse={() => setInputCollapsed((v) => !v)}
        preview={preview}
      >
        <TextInputArea
          fill
          borderless
          placeholder={labels.inputPlaceholder}
          value={input}
          onChange={setInput}
          externalError={error || runtimeError || undefined}
          showClear={true}
          allowCopy={true}
          className="min-h-0 flex-1"
          onClear={() => setInput('')}
        />
      </CollapsiblePanel>

      {result?.output && (
        <div className="flex min-h-0 flex-1">
          <JsonResultPanel
            fill
            title={labels.outputLabel}
            content={result.output}
            originalBytes={result.originalBytes}
            outputBytes={result.outputBytes}
          />
        </div>
      )}
    </div>
  );
}
