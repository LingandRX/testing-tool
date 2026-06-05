import { CopyButton } from '@/components/CopyButton';
import { useI18n } from '@/utils/chromeI18n';
import { stringifyJson } from '@/utils/jwt';
import { cn } from '@/lib/utils';

interface JwtSectionProps {
  title: string;
  content: unknown;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

export default function JwtSection({
  title,
  content,
  colorClass,
  bgClass,
  borderClass,
}: JwtSectionProps) {
  const { t } = useI18n('jwt');
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
      <pre className="m-0 p-3 bg-muted/30 dark:bg-muted/10 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all border border-border/50 text-foreground/90 leading-relaxed select-text">
        {content ? stringifyJson(content) : t('jwt:invalidFormat')}
      </pre>
    </div>
  );
}
