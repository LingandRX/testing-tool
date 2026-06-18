import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, MousePointerClick, AlertTriangle } from 'lucide-react';
import { useRightClickRestorer } from './useRightClickRestorer';

export default function Index() {
  const { domain, isLoading, isUnlocked, isUnsupported, unlock } = useRightClickRestorer();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 min-h-[280px] w-full">
        <span className="text-xs text-muted-foreground mt-2 font-medium tracking-wide">
          {'正在加载...'}
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 w-full flex flex-col space-y-4">
      {/* Current Domain */}
      <div className="w-full rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-4">
          <Label className="text-sm font-medium">{'当前域名'}</Label>
          <div className="mt-2 flex items-center justify-between gap-2">
            <code className="text-sm bg-muted px-2 py-1 rounded truncate min-w-0 flex-1">
              {domain || '—'}
            </code>
            {isUnsupported ? (
              <Badge variant="destructive" className="gap-1 shrink-0">
                <AlertTriangle className="h-3 w-3" />
                {'不支持'}
              </Badge>
            ) : isUnlocked ? (
              <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700 shrink-0">
                <ShieldCheck className="h-3 w-3" />
                {'已解锁'}
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1 shrink-0">
                <Shield className="h-3 w-3" />
                {'未解锁'}
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
                {'当前页面为浏览器内部页面或扩展页面，无法解锁右键功能。请切换到普通网页后重试。'}
              </p>
              <Button className="w-full gap-2" disabled variant="secondary">
                <AlertTriangle className="h-4 w-4" />
                {'不支持'}
              </Button>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                {'点击下方按钮，为当前网站临时解锁右键菜单。刷新页面后需要重新解锁。'}
              </p>
              <Button
                className="w-full gap-2"
                onClick={() => void unlock()}
                disabled={isUnlocked}
                variant={isUnlocked ? 'secondary' : 'default'}
              >
                <MousePointerClick className="h-4 w-4" />
                {isUnlocked ? '右键已解锁' : '解锁当前网站右键'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
