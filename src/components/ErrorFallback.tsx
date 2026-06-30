import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ErrorFallbackProps {
  title: string;
  description: string;
  error: Error | null;
  actionLabel: string;
  onAction: () => void;
  variant?: 'app' | 'page';
  showStack?: boolean;
  className?: string;
}

export function ErrorFallback({
  title,
  description,
  error,
  actionLabel,
  onAction,
  variant = 'page',
  showStack = false,
  className,
}: ErrorFallbackProps) {
  const isApp = variant === 'app';
  const errorText = error ? (showStack ? error.stack || error.toString() : error.toString()) : null;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        isApp
          ? 'mt-16 mx-auto max-w-md'
          : 'flex-1 p-6 min-h-[300px] animate-in fade-in zoom-in-95 duration-200',
        className,
      )}
    >
      <div
        className={cn(
          'p-6 text-center rounded-xl border border-destructive/20 bg-destructive/5 shadow-sm',
          !isApp && 'max-w-md w-full',
        )}
      >
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto mb-4',
            isApp ? 'h-16 w-16' : 'h-12 w-12',
          )}
        >
          <AlertCircle className={isApp ? 'h-8 w-8' : 'h-6 w-6'} />
        </div>

        {isApp ? (
          <h2 className="text-xl font-extrabold text-destructive mb-2">{title}</h2>
        ) : (
          <h3 className="text-base font-semibold text-foreground mb-1.5">{title}</h3>
        )}

        <p
          className={
            isApp ? 'text-sm text-muted-foreground mb-6' : 'text-xs text-muted-foreground mb-5'
          }
        >
          {description}
        </p>

        {errorText && (
          <div
            className={cn(
              'rounded-lg bg-zinc-950 dark:bg-zinc-900 text-left border border-border/40',
              isApp ? 'mb-6 p-4 max-h-[200px] overflow-auto' : 'mb-5 p-3 max-h-40 overflow-y-auto',
            )}
          >
            <pre
              className={cn(
                'font-mono whitespace-pre-wrap break-all text-zinc-200 selection:bg-zinc-700',
                isApp ? 'text-xs' : 'text-[11px] leading-relaxed',
              )}
            >
              {errorText}
            </pre>
          </div>
        )}

        <Button
          variant="destructive"
          size={isApp ? 'default' : 'sm'}
          onClick={onAction}
          className={isApp ? 'rounded-lg font-bold shadow-sm' : 'font-medium shadow-sm'}
        >
          <RefreshCw className={isApp ? 'mr-2 h-4 w-4' : 'mr-1.5 h-3.5 w-3.5'} />
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
