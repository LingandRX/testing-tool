import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { CARD_CLASS, DOMAIN_LABEL, LOADING_TEXT, STATUS_CONFIG } from './constants';
import { useRightClickRestorer } from './useRightClickRestorer';

export default function Index() {
  const { domain, isLoading, status, unlock } = useRightClickRestorer();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 min-h-[280px] w-full">
        <Loader2 className="h-6 w-6 text-muted-foreground/80 animate-spin" />
        <span className="text-xs text-muted-foreground mt-2 font-medium tracking-wide">
          {LOADING_TEXT}
        </span>
      </div>
    );
  }

  const config = STATUS_CONFIG[status];
  const BadgeIcon = config.badgeIcon;
  const ButtonIcon = config.buttonIcon;

  return (
    <div className="p-4 w-full flex flex-col space-y-4">
      <div className={CARD_CLASS}>
        <Label className="text-sm font-medium">{DOMAIN_LABEL}</Label>
        <div className="flex items-center justify-between gap-2">
          <code className="text-sm bg-muted px-2 py-1 rounded truncate min-w-0 flex-1">
            {domain || '—'}
          </code>
          <Badge variant={config.badgeVariant} className={config.badgeClassName}>
            <BadgeIcon className="h-3 w-3" />
            {config.badgeLabel}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground">{config.description}</p>
        <Button
          className="w-full gap-2"
          disabled={config.buttonDisabled}
          variant={config.buttonVariant}
          onClick={config.buttonDisabled ? undefined : () => void unlock()}
        >
          <ButtonIcon className="h-4 w-4" />
          {config.buttonLabel}
        </Button>
      </div>
    </div>
  );
}
