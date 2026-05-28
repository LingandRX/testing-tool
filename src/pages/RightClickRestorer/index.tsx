import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, MousePointerClick, AlertTriangle } from 'lucide-react';
import { useRightClickRestorer } from './useRightClickRestorer';
import { useI18n } from '@/utils/chromeI18n';

export default function Index() {
  const { t } = useI18n('rightClickRestorer');
  const { domain, isLoading, isUnlocked, isUnsupported, unlock } = useRightClickRestorer();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 min-h-[280px] w-full">
        <span className="text-xs text-muted-foreground mt-2 font-medium tracking-wide">
          {t('rightClickRestorer:loading')}
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 w-full flex flex-col space-y-4">
      {/* Current Domain */}
      <div className="w-full rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-4">
          <Label className="text-sm font-medium">{t('rightClickRestorer:currentDomain')}</Label>
          <div className="mt-2 flex items-center justify-between gap-2">
            <code className="text-sm bg-muted px-2 py-1 rounded truncate min-w-0 flex-1">
              {domain || '—'}
            </code>
            {isUnsupported ? (
              <Badge variant="destructive" className="gap-1 shrink-0">
                <AlertTriangle className="h-3 w-3" />
                {t('rightClickRestorer:unsupported')}
              </Badge>
            ) : isUnlocked ? (
              <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700 shrink-0">
                <ShieldCheck className="h-3 w-3" />
                {t('rightClickRestorer:statusUnlocked')}
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1 shrink-0">
                <Shield className="h-3 w-3" />
                {t('rightClickRestorer:statusLocked')}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Unlock Action */}
      <div className="w-full rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-4 space-y-3">
          {isUnsupported ? (
            <>
              <p className="text-xs text-muted-foreground">
                {t('rightClickRestorer:unsupportedDesc')}
              </p>
              <Button className="w-full gap-2" disabled variant="secondary">
                <AlertTriangle className="h-4 w-4" />
                {t('rightClickRestorer:unsupported')}
              </Button>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">{t('rightClickRestorer:unlockDesc')}</p>
              <Button
                className="w-full gap-2"
                onClick={() => void unlock()}
                disabled={isUnlocked}
                variant={isUnlocked ? 'secondary' : 'default'}
              >
                <MousePointerClick className="h-4 w-4" />
                {isUnlocked
                  ? t('rightClickRestorer:alreadyUnlocked')
                  : t('rightClickRestorer:unlockBtn')}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
