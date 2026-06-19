import TextInputArea from '@/components/TextInputArea';
import { CopyButton } from '@/components/CopyButton';
import EmptyPlaceholder from '@/components/EmptyPlaceholder';
import JwtSection from './JwtSection';
import { useJwt } from './useJwt';

export default function Index() {
  const { jwtInput, result, handleChange, handleClear } = useJwt();

  return (
    <div className="p-4 w-full flex flex-col space-y-4 select-none">
      <div className="flex flex-col gap-4">
        <TextInputArea
          minRows={5}
          maxRows={10}
          placeholder={'在此粘贴 JWT 令牌 (Encoded JWT)...'}
          value={jwtInput}
          onChange={handleChange}
          allowCopy={true}
          showClear={true}
          externalError={result?.error || undefined}
          onClear={handleClear}
        />

        {result && !result.error && (
          <div className="flex flex-col gap-4">
            <JwtSection
              title={'HEADER: 算法 & 令牌类型'}
              content={result.header}
              colorClass="text-[#fb015b] dark:text-rose-400"
              borderClass="border-[#fb015b]/20 dark:border-rose-500/20"
              bgClass="bg-[#fb015b]/5 dark:bg-rose-500/5"
            />

            <JwtSection
              title={'PAYLOAD: 数据'}
              content={result.payload}
              colorClass="text-[#a03aff] dark:text-purple-400"
              borderClass="border-[#a03aff]/20 dark:border-purple-500/20"
              bgClass="bg-[#a03aff]/5 dark:bg-purple-500/5"
            />

            <div className="p-4 rounded-xl border border-border bg-secondary/40 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold tracking-wider text-muted-foreground/90 uppercase">
                  {'签名'}
                </span>
                <CopyButton
                  text={result.signature || ''}
                  className="h-6 w-6 rounded-md border text-muted-foreground"
                />
              </div>
              <span className="block text-xs font-mono break-all text-foreground/80 bg-muted/30 dark:bg-muted/10 p-3 rounded-lg border border-border/50 leading-relaxed select-text">
                {result.signature || '无签名'}
              </span>
            </div>
          </div>
        )}

        {result?.error && (
          <EmptyPlaceholder className="p-6 min-h-0">{'无效的 JSON 格式'}</EmptyPlaceholder>
        )}
      </div>
    </div>
  );
}
