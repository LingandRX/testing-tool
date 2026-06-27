import React, { useEffect, useMemo, useState } from 'react';
import EmptyPlaceholder from '@/components/EmptyPlaceholder';
import TextInputArea from '@/components/TextInputArea';
import JsonResultPanel from './JsonResultPanel';
import { validateJson } from '@/utils/jsonFormatter';
import { cn } from '@/lib/utils';
import type { ConvertFunction, ConvertResult } from '../types';

const CONVERT_LABELS: Record<
  string,
  { inputPlaceholder: string; outputLabel: string; emptyHint: string }
> = {
  yaml: {
    inputPlaceholder: '输入需要转换的 JSON...',
    outputLabel: 'YAML 结果',
    emptyHint: '输入 JSON 后点击转换',
  },
  toml: {
    inputPlaceholder: '输入需要转换的 JSON...',
    outputLabel: 'TOML 结果',
    emptyHint: '输入 JSON 后点击转换',
  },
  minify: {
    inputPlaceholder: '输入需要压缩的 JSON...',
    outputLabel: '压缩结果',
    emptyHint: '输入 JSON 后点击压缩',
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

  return (
    <div className={cn('w-full flex flex-col gap-4', className)} {...props}>
      <TextInputArea
        placeholder={labels.inputPlaceholder}
        value={input}
        onChange={setInput}
        externalError={error || runtimeError || undefined}
        showClear={true}
        allowCopy={true}
        minRows={7}
        maxRows={14}
        onClear={() => setInput('')}
      />

      {result?.output ? (
        <JsonResultPanel
          title={labels.outputLabel}
          content={result.output}
          originalBytes={result.originalBytes}
          outputBytes={result.outputBytes}
          maxHeight="380px"
        />
      ) : (
        <EmptyPlaceholder>
          {error ? '请修正上方 JSON 的语法错误以开启实时流式格式化' : labels.emptyHint}
        </EmptyPlaceholder>
      )}
    </div>
  );
}
