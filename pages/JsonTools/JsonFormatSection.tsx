import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import {
  formatJson,
  validateJson,
  type JsonFormatOptions,
  type JsonFormatResult,
} from '@/utils/jsonFormatter';
import { formatByteSize } from '@/utils/textStatistics';
import { useSnackbar } from '@/components/GlobalSnackbar';
import CopyButton from '@/components/CopyButton';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';

/** 缩进大小选项 */
const INDENT_OPTIONS = [2, 4, 6, 8] as const;

/**
 * JSON 格式化工具区域组件
 *
 * 提供输入区域、格式化选项（缩进大小、键名排序）和格式化结果展示，
 * 支持一键复制格式化后的 JSON。
 */
export default function JsonFormatSection() {
  const { t } = useLazyTranslation('jsonFormat');
  const { showMessage } = useSnackbar();

  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [indentSize, setIndentSize] = useState<number>(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [result, setResult] = useState<JsonFormatResult | null>(null);

  // 防抖校验输入
  useEffect(() => {
    const handle = setTimeout(() => {
      setError(validateJson(input));
    }, 300);
    return () => clearTimeout(handle);
  }, [input]);

  const canFormat = useMemo(() => {
    return input.trim() !== '' && !error;
  }, [input, error]);

  const handleFormat = () => {
    const validationError = validateJson(input);
    if (validationError) {
      setError(validationError);
      setResult(null);
      return;
    }

    try {
      const options: JsonFormatOptions = { indentSize, sortKeys };
      const formatResult = formatJson(input, options);
      setResult(formatResult);
    } catch (e) {
      setError(e instanceof SyntaxError ? e.message : String(e));
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
        <div className="flex gap-3 items-center">
          {/* 缩进选择 */}
          <span className="text-[11px] font-extrabold text-muted-foreground">
            {t('jsonFormat:indentSize')}
          </span>
          <SwitchButtonGroup
            value={indentSize}
            onChange={(v) => setIndentSize(v)}
            options={INDENT_OPTIONS.map((size) => ({ value: size, label: String(size) }))}
            sx={{ width: 'auto', marginBottom: 0, flexShrink: 0 }}
            size="small"
          />

          {/* 键名排序开关 */}
          <label className="flex items-center gap-2 ml-2">
            <input
              type="checkbox"
              checked={sortKeys}
              onChange={(e) => setSortKeys(e.target.checked)}
              className="h-4 w-4 rounded border-input text-blue-500 focus:ring-primary"
            />
            <span className="text-xs font-bold">{t('jsonFormat:sortKeys')}</span>
          </label>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClear} className="rounded-lg">
            {t('jsonFormat:clearButton')}
          </Button>
          <Button
            variant="default"
            disabled={!canFormat}
            onClick={handleFormat}
            className="rounded-lg font-bold px-4"
          >
            {t('jsonFormat:formatButton')}
          </Button>
        </div>
      </div>

      {/* 输入区 */}
      <div>
        <textarea
          placeholder={t('jsonFormat:inputPlaceholder')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          className={`w-full rounded-lg border ${
            error ? 'border-red-300' : 'border-border'
          } p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y`}
        />
        {error && (
          <p className="mx-3 mt-1 text-xs font-semibold text-red-500">
            {t('jsonFormat:invalidJson')}
          </p>
        )}
      </div>

      {/* 格式化结果 */}
      {result && result.formatted ? (
        <div className="relative rounded-lg bg-background border border-border overflow-hidden">
          {/* 结果头部 */}
          <div className="flex justify-between items-center px-4 py-2 border-b border-border bg-muted">
            <div className="flex gap-4 items-center">
              <span className="text-[11px] font-extrabold text-muted-foreground">
                {t('jsonFormat:outputLabel')}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {t('jsonFormat:originalSize')}: {formatByteSize(result.originalBytes)}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {t('jsonFormat:formattedSize')}: {formatByteSize(result.formattedBytes)}
              </span>
            </div>
            <CopyButton text={result.formatted} showMessage={showMessage} />
          </div>

          {/* 格式化内容 */}
          <div className="p-4 font-mono text-sm whitespace-pre-wrap break-all max-h-[400px] overflow-y-auto leading-relaxed">
            {result.formatted}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-muted border border-dashed border-input text-center">
          <p className="text-sm font-semibold text-muted-foreground">{t('jsonFormat:emptyHint')}</p>
        </div>
      )}
    </div>
  );
}
