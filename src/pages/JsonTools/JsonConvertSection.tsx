import React, { useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/utils/chromeI18n';
import { formatBytes } from '@/utils/format';
import CopyButton from '@/components/CopyButton';
import TextInputArea from '@/components/TextInputArea';
import { validateJson } from '@/utils/jsonFormatter';
import { cn } from '@/lib/utils';

export interface ConvertResult {
  output: string;
  originalBytes: number;
  outputBytes: number;
}

export type ConvertFunction = (text: string) => ConvertResult;

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
  const { t } = useI18n('jsonFormat');

  const [input, setInput] = useState('');
  const [debouncedInput, setDebouncedInput] = useState('');

  const pk = translationPrefix;

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
        placeholder={t(`jsonFormat:${pk}InputPlaceholder`)}
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
        <div className="relative rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="flex h-9 items-center justify-between px-4 border-b border-border bg-muted/50 select-none">
            <div className="flex gap-4 items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90">
                {t(`jsonFormat:${pk}OutputLabel`)}
              </span>

              <div className="hidden sm:flex gap-3 items-center font-mono text-[10px] text-muted-foreground/70 tabular-nums">
                <span>
                  {t('jsonFormat:originalSize')}:{' '}
                  <span className="font-semibold text-foreground/80">
                    {formatBytes(result.originalBytes)}
                  </span>
                </span>
                <span className="text-border/60">|</span>
                <span>
                  {t('jsonFormat:formattedSize')}:{' '}
                  <span className="font-semibold text-foreground/80">
                    {formatBytes(result.outputBytes)}
                  </span>
                </span>
              </div>
            </div>

            <CopyButton
              text={result.output}
              className="h-6 w-6 rounded-md border text-muted-foreground"
            />
          </div>

          <div className="p-4 font-mono text-xs text-foreground/90 whitespace-pre-wrap break-all max-h-[380px] overflow-y-auto leading-relaxed select-text">
            {result.output}
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-xl bg-muted/30 border border-dashed border-border/80 text-center flex flex-col items-center justify-center min-h-[120px] select-none">
          <p className="text-xs font-semibold text-muted-foreground/80 tracking-wide max-w-[240px] leading-relaxed">
            {error ? t('jsonFormat:fixErrorHint') : t(`jsonFormat:${pk}EmptyHint`)}
          </p>
        </div>
      )}
    </div>
  );
}
