import React, { useEffect, useMemo, useState } from 'react';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import { formatByteSize } from '@/utils/textStatistics';
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
  const { t } = useLazyTranslation('jsonFormat');

  const [input, setInput] = useState('');
  const [debouncedInput, setDebouncedInput] = useState('');

  const pk = translationPrefix;

  // 1. 高阶性能调优：将文本变化收拢进行 250ms 极速防抖落盘，避免每一次敲击键盘都触发底层的复杂序列化算法
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedInput(input);
    }, 250);
    return () => clearTimeout(handle);
  }, [input]);

  // 💡 2. 贯彻方案 A（衍生变量超进化）：
  // 彻底删掉 error 状态和对应的受控 useEffect 节点。
  // 语法错误由防抖文本在内存中同步推导，彻底斩断二次级联渲染链条，ESLint 警告自愈！
  const error = useMemo(() => {
    return validateJson(debouncedInput);
  }, [debouncedInput]);

  // 3. 核心魔法：纯净的即时流式转换转换管线 (Live Compilation Pipeline)
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

  // 判定运行时异常
  const runtimeError =
    conversionPipeline && 'isRuntimeError' in conversionPipeline
      ? conversionPipeline.errorMessage
      : null;
  const result =
    conversionPipeline && !('isRuntimeError' in conversionPipeline)
      ? (conversionPipeline as ConvertResult)
      : null;

  return (
    <div
      className={cn('w-full flex flex-col gap-4 animate-in fade-in duration-300', className)}
      {...props}
    >
      {/* 输入区 */}
      <TextInputArea
        placeholder={t(`jsonFormat:${pk}InputPlaceholder`)}
        value={input}
        onChange={setInput}
        externalError={error || runtimeError || undefined} // 融合语法错误与运行时转换错误
        showClear={true}
        allowCopy={true}
        minRows={7}
        maxRows={14}
        onClear={() => setInput('')}
      />

      {/* 4. 结果展示或状态引导卡片区 */}
      {result && result.output ? (
        <div className="relative rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
          {/* 结果栏精致头部 */}
          <div className="flex h-9 items-center justify-between px-4 border-b border-border bg-muted/50 select-none">
            <div className="flex gap-4 items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90">
                {t(`jsonFormat:${pk}OutputLabel`)}
              </span>

              {/* 字节比对注入 tabular-nums font-mono，防止容量大小变动时字符横向抽搐 */}
              <div className="hidden sm:flex gap-3 items-center font-mono text-[10px] text-muted-foreground/70 tabular-nums">
                <span>
                  {t('jsonFormat:originalSize')}:{' '}
                  <span className="font-semibold text-foreground/80">
                    {formatByteSize(result.originalBytes)}
                  </span>
                </span>
                <span className="text-border/60">|</span>
                <span>
                  {t('jsonFormat:formattedSize')}:{' '}
                  <span className="font-semibold text-foreground/80">
                    {formatByteSize(result.outputBytes)}
                  </span>
                </span>
              </div>
            </div>

            <CopyButton
              text={result.output}
              className="h-6 w-6 rounded-md border text-muted-foreground"
            />
          </div>

          {/* 转换出的数据流承载区：
            💡 修复点：移除了互相冲突打架的 select-all 类名，仅保留纯净、支持自由划线选中的 select-text 样式 
          */}
          <div className="p-4 font-mono text-xs text-foreground/90 whitespace-pre-wrap break-all max-h-[380px] overflow-y-auto leading-relaxed select-text">
            {result.output}
          </div>
        </div>
      ) : (
        /* 5. 空状态提示容器：完美的中性虚线引导，不喧宾夺主 */
        <div className="p-8 rounded-xl bg-muted/30 border border-dashed border-border/80 text-center flex flex-col items-center justify-center min-h-[120px] select-none">
          <p className="text-xs font-semibold text-muted-foreground/80 tracking-wide max-w-[240px] leading-relaxed">
            {error ? '请修正上方 JSON 的语法错误以激活流式转换' : t(`jsonFormat:${pk}EmptyHint`)}
          </p>
        </div>
      )}
    </div>
  );
}
