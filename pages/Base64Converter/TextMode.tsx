import { useCallback, useEffect, useMemo, useState } from 'react';
import TextInputArea from '@/components/TextInputArea';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import CopyButton from '@/components/CopyButton';
import { base64ToText, textToBase64 } from '@/utils/base64Converter';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import { useContextMenuData } from '@/utils/useContextMenuData';
import { Button } from '@/components/ui/button';

const IMAGE_DATA_URI_PATTERN = /^\s*data:image\//i;

const ERROR_MESSAGE_TO_I18N: Record<string, string> = {
  'Invalid Base64 string': 'invalidBase64',
  'Input appears to be binary data (e.g. an image). Please use the Image tab instead.':
    'binaryDataDetected',
};

interface TextModeProps {
  onSwitchToImageMode?: () => void;
}

export default function TextMode({ onSwitchToImageMode }: TextModeProps = {}) {
  const { t } = useLazyTranslation('base64Converter');

  // 1. 纯净的核心源状态机：只保留输入源和转换方向
  const [input, setInput] = useState('');
  const [debouncedInput, setDebouncedInput] = useState('');
  const [direction, setDirection] = useState<'encode' | 'decode'>('encode');

  // 2. 文本高频敲击防抖大闸：斩断频繁进行文本转 Base64 带来的 CPU 计算过热
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedInput(input);
    }, 200);
    return () => clearTimeout(handle);
  }, [input]);

  // 3. 右键联动数据上下文：优雅原地合并受控状态
  const handleContextMenuData = useCallback((payload: string) => {
    setInput(payload);
    setDebouncedInput(payload);
    setDirection('decode');
  }, []);

  useContextMenuData({ featureKey: 'base64Converter', onData: handleContextMenuData });

  // 💡 4. 贯彻方案 A（彻底消灭 setOutput / setError）：
  // 让所有的转化逻辑、类型安全校验在 useMemo 内存管道中单次渲染一气呵成！
  const conversionPipeline = useMemo(() => {
    const trimmed = debouncedInput.trim();
    if (!trimmed) return { output: '', error: null };

    try {
      if (direction === 'encode') {
        const result = textToBase64(debouncedInput);
        return { output: result.output, error: null };
      } else {
        const decoded = base64ToText(trimmed);
        return { output: decoded, error: null };
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : '';
      const i18nKey = ERROR_MESSAGE_TO_I18N[message];
      return {
        output: '',
        error: i18nKey ? t(i18nKey) : message || t('conversionFailed'),
      };
    }
  }, [debouncedInput, direction, t]);

  const output = conversionPipeline.output;
  const error = conversionPipeline.error;

  const placeholder =
    direction === 'encode' ? t('textInputPlaceholder') : t('base64InputPlaceholder');
  const outputLabel = direction === 'encode' ? t('base64Output') : t('textOutput');

  const showImageHint = useMemo(
    () => direction === 'decode' && IMAGE_DATA_URI_PATTERN.test(input),
    [direction, input],
  );

  const handleDirectionChange = (value: 'encode' | 'decode') => {
    if (value === direction) return;
    setDirection(value);
    setInput('');
    setDebouncedInput('');
  };

  const handleClear = () => {
    setInput('');
    setDebouncedInput('');
  };

  return (
    <div className="w-full flex flex-col space-y-4 animate-in fade-in duration-300">
      {/* 受控方向切流中枢 */}
      <div className="flex h-11 items-center px-1.5 bg-secondary/40 rounded-xl border border-border/60 w-fit">
        <SwitchButtonGroup
          value={direction}
          options={[
            { value: 'encode', label: t('encode') },
            { value: 'decode', label: t('decode') },
          ]}
          onChange={handleDirectionChange}
          size="small"
        />
      </div>

      {/* 高性能受控文本输入端 */}
      <TextInputArea
        placeholder={placeholder}
        value={input}
        onChange={setInput}
        externalError={error || undefined} // 💡 流式异常大闸动态注入
        showClear={true}
        allowCopy={true}
        minRows={5}
        maxRows={10}
        onClear={handleClear}
      />

      {/* 图片 URI 类型劫持警告引导区：
        - 💡 修复点：彻底废除原生亮色硬编码 hover:bg-blue-100 类名，
        - 完美向全站 shadcn 暗黑生态看齐，采用标准的 bg-primary/10 混合变体。
      */}
      {showImageHint && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-primary/10 border border-primary/20 animate-in slide-in-from-top-1 duration-200">
          <span className="text-xs font-semibold text-primary tracking-tight">
            {t('imageDataUriHint')}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSwitchToImageMode}
            className="h-7 rounded-md text-xs font-bold text-primary hover:text-primary hover:bg-primary/20 dark:hover:bg-primary/10 transition-colors px-2.5"
          >
            {t('switchToImageMode')}
          </Button>
        </div>
      )}

      {/* 5. 编码/解码核心数据承载流卡片 */}
      {output && (
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col space-y-3 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between items-center select-none">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90">
              {outputLabel}
            </span>
            <CopyButton
              text={output}
              className="h-6 px-2 rounded-md border text-[10px] font-bold"
            />
          </div>

          <TextInputArea
            readOnly
            value={output.length > 2000 ? `${output.substring(0, 2000)}...` : output}
            showClear={false}
            minRows={4}
          />
        </div>
      )}
    </div>
  );
}
