import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, MousePointerClick } from 'lucide-react';
import { useRightClickRestorer } from './useRightClickRestorer';
import { useLazyTranslation } from '@/utils/useLazyTranslation';

export default function RightClickRestorerPage() {
  const { t } = useLazyTranslation('rightClickRestorer');
  const { domain, isLoading, isUnlocked, unlock } = useRightClickRestorer();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 min-h-[280px] w-full animate-in fade-in duration-200">
        <span className="text-xs text-muted-foreground mt-2 font-medium tracking-wide">
          {t('rightClickRestorer:loading')}
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 w-full flex flex-col space-y-4 animate-in fade-in duration-300">
      {/* Current Domain */}
      <div className="w-full rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden transition-all">
        <div className="p-4">
          <Label className="text-sm font-medium">{t('rightClickRestorer:currentDomain')}</Label>
          <div className="mt-2 flex items-center justify-between">
            <code className="text-sm bg-muted px-2 py-1 rounded">{domain || '—'}</code>
            {isUnlocked ? (
              <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700">
                <ShieldCheck className="h-3 w-3" />
                {t('rightClickRestorer:statusUnlocked')}
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <Shield className="h-3 w-3" />
                {t('rightClickRestorer:statusLocked')}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Unlock Action */}
      <div className="w-full rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden transition-all">
        <div className="p-4 space-y-3">
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
        </div>
      </div>
    </div>
  );
}
