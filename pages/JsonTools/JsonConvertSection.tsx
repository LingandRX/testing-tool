import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import { formatByteSize } from '@/utils/textStatistics';
import CopyButton from '@/components/CopyButton';
import TextInputArea from '@/components/TextInputArea';
import { validateJson } from '@/utils/jsonFormatter';

/** 转换结果通用接口 */
export interface ConvertResult {
  /** 转换后的输出字符串 */
  output: string;
  /** 原始输入的字节大小 */
  originalBytes: number;
  /** 转换后的字节大小 */
  outputBytes: number;
}

/** 转换函数类型 */
export type ConvertFunction = (text: string) => ConvertResult;

/**
 * JSON 转换工具区域组件属性
 */
interface JsonConvertSectionProps {
  /** i18n 命名空间内翻译键的前缀，如 'yamlMode' / 'tomlMode' / 'minifyMode' */
  translationPrefix: string;
  /** 转换函数 */
  convertFunction: ConvertFunction;
  /** 转换按钮的翻译键后缀，默认 'convertButton' */
  convertButtonKey?: string;
}

/**
 * JSON 转换工具共享组件
 *
 * 适用于 JSON->YAML、JSON->TOML、JSON 压缩等场景，
 * 提供输入区域、转换按钮和结果展示（含一键复制）。
 */
export default function JsonConvertSection({
  translationPrefix,
  convertFunction,
  convertButtonKey = 'convertButton',
}: JsonConvertSectionProps) {
  const { t } = useLazyTranslation('jsonFormat');

  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConvertResult | null>(null);

  const pk = translationPrefix;

  // 防抖校验输入
  useEffect(() => {
    const handle = setTimeout(() => {
      setError(validateJson(input));
    }, 300);
    return () => clearTimeout(handle);
  }, [input]);

  const canConvert = useMemo(() => {
    return input.trim() !== '' && !error;
  }, [input, error]);

  const handleConvert = () => {
    const validationError = validateJson(input);
    if (validationError) {
      setError(validationError);
      setResult(null);
      return;
    }

    try {
      const convertResult = convertFunction(input);
      setResult(convertResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setResult(null);
    }
  };

  const handleClear = () => {
    setInput('');
    setError(null);
    setResult(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 工具栏 */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div />
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClear} className="rounded-lg">
            {t('jsonFormat:clearButton')}
          </Button>
          <Button
            variant="default"
            disabled={!canConvert}
            onClick={handleConvert}
            className="rounded-lg font-bold px-4"
          >
            {t(`jsonFormat:${convertButtonKey}`)}
          </Button>
        </div>
      </div>

      {/* 输入区 */}
      <TextInputArea
        placeholder={t(`jsonFormat:${pk}InputPlaceholder`)}
        value={input}
        onChange={setInput}
        externalError={error || undefined}
        onClear={() => {
          setResult(null);
        }}
      />

      {/* 转换结果 */}
      {result && result.output ? (
        <div className="relative rounded-lg bg-background border border-border overflow-hidden">
          {/* 结果头部 */}
          <div className="flex justify-between items-center px-4 py-2 border-b border-border bg-muted">
            <div className="flex gap-4 items-center">
              <span className="text-[11px] font-extrabold text-muted-foreground">
                {t(`jsonFormat:${pk}OutputLabel`)}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {t('jsonFormat:originalSize')}: {formatByteSize(result.originalBytes)}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {t('jsonFormat:formattedSize')}: {formatByteSize(result.outputBytes)}
              </span>
            </div>
            <CopyButton text={result.output} />
          </div>

          {/* 转换内容 */}
          <div className="p-4 font-mono text-sm whitespace-pre-wrap break-all max-h-[400px] overflow-y-auto leading-relaxed">
            {result.output}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-muted border border-dashed border-input text-center">
          <p className="text-sm font-semibold text-muted-foreground">
            {t(`jsonFormat:${pk}EmptyHint`)}
          </p>
        </div>
      )}
    </div>
  );
}
