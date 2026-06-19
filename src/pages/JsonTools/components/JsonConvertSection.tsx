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
  translationPrefix: string;
  convertFunction: ConvertFunction;
}

export default function JsonConvertSection({
  translationPrefix,
  convertFunction,
  className,
  ...props
}: JsonConvertSectionProps) {
  const [input, setInput] = useState('');
  const [debouncedInput, setDebouncedInput] = useState('');

  const pk = translationPrefix;
  const labels = CONVERT_LABELS[pk] || CONVERT_LABELS.yaml;

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

  const conversionPipeline = useMemo(() => {
    const trimmed = debouncedInput.trim();
    if (!trimmed || error) return null;

    try {
      return convertFunction(debouncedInput);
    } catch (e) {
      // 捕获可能从外部转换器（如 YAML.stringify）中抛出的底层异常
      return {
        isRuntimeError: true,
        errorMessage: e instanceof Error ? e.message : String(e),
      };
    }
  }, [debouncedInput, error, convertFunction]);

  const runtimeError =
    conversionPipeline && 'isRuntimeError' in conversionPipeline
      ? conversionPipeline.errorMessage
      : null;
  const result =
    conversionPipeline && !('isRuntimeError' in conversionPipeline)
      ? (conversionPipeline as ConvertResult)
      : null;

  return (
    <div className={cn('w-full flex flex-col gap-4', className)} {...props}>
      {/* 输入区 */}
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

      {/* Result display */}
      {result && result.output ? (
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
