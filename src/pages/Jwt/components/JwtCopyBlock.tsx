import { CopyButton } from '@/components/CopyButton';
import { cn } from '@/lib/utils';

interface JwtCopyBlockProps {
  title: string;
  copyText: string;
  titleClassName?: string;
  containerClassName?: string;
  children: React.ReactNode;
}

export default function JwtCopyBlock({
  title,
  copyText,
  titleClassName,
  containerClassName,
  children,
}: JwtCopyBlockProps) {
  return (
    <div className={cn('p-4 rounded-xl border shadow-sm', containerClassName)}>
      <div className="flex justify-between items-center mb-2 select-none">
        <span className={cn('text-xs font-bold tracking-wider uppercase', titleClassName)}>
          {title}
        </span>
        <CopyButton text={copyText} className="h-6 w-6 rounded-md border text-muted-foreground" />
      </div>
      {children}
    </div>
  );
}
