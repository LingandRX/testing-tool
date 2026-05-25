import { useCallback, useEffect, useMemo, useState } from 'react';
import { parseJwt, stringifyJson } from '@/utils/jwt';
import CopyButton from '@/components/CopyButton';
import TextInputArea from '@/components/TextInputArea';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import { useContextMenuData } from '@/utils/useContextMenuData';
import { cn } from '@/lib/utils';

interface SectionProps {
  title: string;
  content: unknown;
  colorClass: string; // 💡 1. 废除硬编码十六进制色值，改用语义化的 Tailwind 类名
  bgClass: string;
  borderClass: string;
}

const Section = ({ title, content, colorClass, bgClass, borderClass }: SectionProps) => {
  const { t } = useLazyTranslation('jwt');
  return (
    <div className={cn('p-4 rounded-xl border border-solid', bgClass, borderClass)}>
      <div className="flex justify-between items-center mb-2 select-none">
        <span className={cn('text-xs font-bold tracking-wider uppercase', colorClass)}>
          {title}
        </span>
        <CopyButton
          text={JSON.stringify(content)}
          className="h-6 w-6 rounded-md border text-muted-foreground"
        />
      </div>
      {/* 💡 排版微距精雕：
        - 彻底移除 border-black/5 这种非暗黑模式友好的硬隔离。
        - 统一收拢为标准的 bg-muted/40 配合 font-mono text-xs
      */}
      <pre className="m-0 p-3 bg-muted/30 dark:bg-muted/10 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all border border-border/50 text-foreground/90 leading-relaxed select-text">
        {content ? stringifyJson(content) : t('jwt:invalidFormat')}
      </pre>
    </div>
  );
};

export default function Index() {
  const { t } = useLazyTranslation(['jwt', 'jsonFormat']);
  const [jwtInput, setJwtInput] = useState('');

  // 2. 防抖中转管道：切断高频键盘敲击时的红色语法闪烁
  const [debouncedInput, setDebouncedInput] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedInput(jwtInput);
    }, 200);
    return () => clearTimeout(handle);
  }, [jwtInput]);

  const handleContextMenuData = useCallback((payload: string) => {
    const cleaned = payload.replace(/^Bearer\s*/i, '').trim();
    setJwtInput(cleaned);
  }, []);

  useContextMenuData({ featureKey: 'jwt', onData: handleContextMenuData });

  // 3. 贯彻方案 A：衍生变量流。直接消费防抖后的文本
  const result = useMemo(() => {
    if (!debouncedInput.trim()) {
      return null;
    }
    return parseJwt(debouncedInput);
  }, [debouncedInput]);

  return (
    <div className="p-4 w-full flex flex-col space-y-4 select-none">
      <div className="flex flex-col gap-4">
        {/* 输入终端 */}
        <TextInputArea
          minRows={5}
          maxRows={10}
          placeholder={t('jwt:placeholder')}
          value={jwtInput}
          onChange={(val) => {
            const cleaned = val.replace(/^Bearer\s*/i, '').trim();
            setJwtInput(cleaned);
          }}
          allowCopy={true}
          showClear={true}
          externalError={result?.error || undefined}
          onClear={() => setJwtInput('')}
        />

        {/* 解码看板结果展现 */}
        {result && !result.error && (
          <div className="flex flex-col gap-4">
            {/* Header 分区：完美致敬 JWT.io 的鲜艳色彩，同时实现黑夜暗化自适应 */}
            <Section
              title={t('jwt:headerTitle')}
              content={result.header}
              colorClass="text-[#fb015b] dark:text-rose-400"
              borderClass="border-[#fb015b]/20 dark:border-rose-500/20"
              bgClass="bg-[#fb015b]/5 dark:bg-rose-500/5"
            />

            {/* Payload 分区 */}
            <Section
              title={t('jwt:payloadTitle')}
              content={result.payload}
              colorClass="text-[#a03aff] dark:text-purple-400" // 针对暗黑模式略微调高对比度
              borderClass="border-[#a03aff]/20 dark:border-purple-500/20"
              bgClass="bg-[#a03aff]/5 dark:bg-purple-500/5"
            />

            {/* Signature 签名区：完全对齐标准的 shadcn 骨架阶度 */}
            <div className="p-4 rounded-xl border border-border bg-secondary/40 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold tracking-wider text-muted-foreground/90 uppercase">
                  {t('jwt:signatureTitle')}
                </span>
                <CopyButton
                  text={result.signature || ''}
                  className="h-6 w-6 rounded-md border text-muted-foreground"
                />
              </div>
              <span className="block text-xs font-mono break-all text-foreground/80 bg-muted/30 dark:bg-muted/10 p-3 rounded-lg border border-border/50 leading-relaxed select-text">
                {result.signature || t('jwt:noSignature')}
              </span>
            </div>
          </div>
        )}

        {/* 当解析错误时的干净中性引导拦截 */}
        {result?.error && (
          <div className="p-6 rounded-xl bg-muted/30 border border-dashed border-border text-center">
            <p className="text-xs font-semibold text-muted-foreground/80">
              {t('jsonFormat:invalidJson')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
