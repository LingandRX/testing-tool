import { useEffect, useMemo, useState } from 'react';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import {
  formatJson,
  type JsonFormatOptions,
  type JsonFormatResult,
  validateJson,
} from '@/utils/jsonFormatter';
import { formatByteSize } from '@/utils/textStatistics';
import CopyButton from '@/components/CopyButton';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import TextInputArea from '@/components/TextInputArea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function JsonFormatSection() {
  const { t } = useLazyTranslation('jsonFormat');

  const [input, setInput] = useState('');
  const [debouncedInput, setDebouncedInput] = useState('');
  const [indentSize, setIndentSize] = useState<number>(2);
  const [sortKeys, setSortKeys] = useState(false);

  // 1. 高频打字防抖落盘：防止大体积 JSON 在高频输入时发生卡顿
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedInput(input);
    }, 250);
    return () => clearTimeout(handle);
  }, [input]);

  // 💡 2. 贯彻方案 A（衍生变量超进化）：
  // 彻底删除原有的 setError 状态和相关的 useEffect。
  // 语法错误由防抖文本在内存中同步推导，彻底斩断二次级联渲染链条，ESLint 警告瞬间消亡！
  const error = useMemo(() => {
    return validateJson(debouncedInput);
  }, [debouncedInput]);

  // 3. 实时流式格式化管线
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
    <div className="w-full flex flex-col gap-4 animate-in fade-in duration-300">
      {/* 工具控制栏 */}
      <div className="flex h-10 items-center justify-between px-1.5 bg-secondary/40 rounded-xl border border-border/60">
        <div className="flex gap-4 items-center w-full">
          {/* 缩进配置区 */}
          <div className="flex gap-2 items-center shrink-0 select-none">
            <span className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-wider">
              {t('jsonFormat:indentSize')}
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
              className="text-xs font-bold text-foreground/80 cursor-pointer tracking-tight group-hover:text-foreground transition-colors"
            >
              {t('jsonFormat:sortKeys')}
            </Label>
          </div>
        </div>
      </div>

      {/* 满血版输入终端 */}
      <TextInputArea
        placeholder={t('jsonFormat:inputPlaceholder')}
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
        <div className="relative rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
          {/* 结果栏头部 */}
          <div className="flex h-9 items-center justify-between px-4 border-b border-border bg-muted/50 select-none">
            <div className="flex gap-4 items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90">
                {t('jsonFormat:outputLabel')}
              </span>

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
                    {formatByteSize(result.formattedBytes)}
                  </span>
                </span>
              </div>
            </div>

            <CopyButton
              text={result.formatted}
              className="h-6 w-6 rounded-md border text-muted-foreground"
            />
          </div>

          {/* 核心格式化数据面板：
            💡 修复点：移除了互相打架的 select-all 类名，仅保留纯正的代码高亮可选样式 select-text
          */}
          <div className="p-4 font-mono text-xs text-foreground/90 whitespace-pre-wrap break-all max-h-[420px] overflow-y-auto leading-relaxed select-text">
            {result.formatted}
          </div>
        </div>
      ) : (
        /* 空状态指示引导区 */
        <div className="p-8 rounded-xl bg-muted/30 border border-dashed border-border/80 text-center flex flex-col items-center justify-center min-h-[120px] select-none">
          <p className="text-xs font-semibold text-muted-foreground/80 tracking-wide max-w-[240px] leading-relaxed">
            {error ? '请修正上方 JSON 语法错误以开启实时流式格式化' : t('jsonFormat:emptyHint')}
          </p>
        </div>
      )}
    </div>
  );
}
