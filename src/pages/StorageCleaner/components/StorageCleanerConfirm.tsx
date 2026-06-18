import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import type { StorageCleanerOptions } from '@/types/storage';
import { cn } from '@/lib/utils';

export interface StorageCleanerConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  options: StorageCleanerOptions;
}

const OPTION_LABELS: Record<string, string> = {
  localStorage: 'Local Storage',
  sessionStorage: 'Session Storage',
  indexedDB: '站点存储',
  cookies: 'Cookies',
  cacheStorage: 'Cache Storage',
  serviceWorkers: 'Service Workers',
};

export function StorageCleanerConfirm({
  open,
  onClose,
  onConfirm,
  options,
}: StorageCleanerConfirmProps) {
  const selectedOptions = Object.entries(options)
    .filter(([_, value]) => value)
    .map(([key, _]) => OPTION_LABELS[key] || key);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className={cn(
          'w-[90%] max-w-[340px] p-6 gap-0 rounded-2xl overflow-hidden shadow-xl border border-border bg-card text-card-foreground',
        )}
      >
        {/* 头部标题区域 */}
        <DialogHeader className="pt-1">
          <DialogTitle className="text-center text-lg font-bold tracking-tight text-foreground">
            {'确认清理数据？'}
          </DialogTitle>
        </DialogHeader>

        {/* 内容主体：限制最大宽度，防止内部元素在大分辨率下被横向拉得太松散 */}
        <div className="text-center py-4 flex flex-col items-center w-full max-w-[280px] mx-auto">
          <DialogDescription className="mb-4 text-xs font-medium text-muted-foreground/90 leading-relaxed">
            {'您将永久删除当前页面的以下选定存储项。'}
          </DialogDescription>

          {/* 待清理项目徽章群 */}
          <div className="flex flex-wrap gap-1.5 justify-center mb-5 w-full">
            {selectedOptions.map((label) => (
              <Badge
                key={label}
                variant="secondary"
                className="px-2.5 py-0.5 text-[11px] font-semibold border border-border/40 select-none bg-muted/60"
              >
                {label}
              </Badge>
            ))}
          </div>

          {/* 风险警告横幅 */}
          <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-destructive/5 border border-dashed border-destructive/20 w-full max-w-[240px]">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
            <span className="text-[11px] font-bold text-destructive leading-none tracking-tight">
              {'此操作不可撤销'}
            </span>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 w-full pt-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            className="w-full text-xs font-bold shadow-sm h-9"
          >
            {'确认清理'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="w-full text-xs font-semibold shadow-sm h-9 text-muted-foreground hover:text-foreground"
          >
            {'取消'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default StorageCleanerConfirm;
