import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import LoadingPlaceholder from '@/components/loading/LoadingPlaceholder';
import { CARD_CLASS, STATUS_CONFIG } from './constants';
import { useRightClickRestorer } from './useRightClickRestorer';

export default function Index() {
  const { domain, isLoading, status, unlock } = useRightClickRestorer();

  if (isLoading) {
    return <LoadingPlaceholder className="min-h-[280px] w-full" />;
  }

  const config = STATUS_CONFIG[status];
  const BadgeIcon = config.badgeIcon;
  const ButtonIcon = config.buttonIcon;

  return (
    <div className="p-4 w-full">
      <div className={CARD_CLASS}>
        <Label className="text-sm font-medium">当前域名</Label>
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
          onClick={() => void unlock()}
        >
          <ButtonIcon className="h-4 w-4" />
          {config.buttonLabel}
        </Button>
      </div>
    </div>
  );
}
