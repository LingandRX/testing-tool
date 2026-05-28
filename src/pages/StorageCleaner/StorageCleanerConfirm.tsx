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
import { useI18n } from '@/utils/chromeI18n';
import { cn } from '@/lib/utils';

export interface StorageCleanerConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  options: StorageCleanerOptions;
}

export function StorageCleanerConfirm({
  open,
  onClose,
  onConfirm,
  options,
}: StorageCleanerConfirmProps) {
  const { t } = useI18n('storageCleaner');

  const selectedOptions = Object.entries(options)
    .filter(([_, value]) => value)
    .map(([key, _]) => t(`storageCleaner:options.${key as keyof StorageCleanerOptions}`));

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      {/* 💡 终极修复秘诀：
        - 移除原来的 sm:max-w-[360px]，改用 max-w-[calc(100%-32px)] 或者是 w-[88%]。
        - 这样无论插件弹窗多窄，它的左右两侧都必然会被强制挤出至少 16px 的完美空白护边！
        - 将 p-5 转换为明确的 p-6，增大弹窗内部的呼吸感。
      */}
      <DialogContent
        className={cn(
          'w-[90%] max-w-[340px] p-6 gap-0 rounded-2xl overflow-hidden shadow-xl border border-border bg-card text-card-foreground',
        )}
      >
        {/* 头部标题区域 */}
        <DialogHeader className="pt-1">
          <DialogTitle className="text-center text-lg font-bold tracking-tight text-foreground">
            {t('storageCleaner:confirmTitle')}
          </DialogTitle>
        </DialogHeader>

        {/* 内容主体：限制最大宽度，防止内部元素在大分辨率下被横向拉得太松散 */}
        <div className="text-center py-4 flex flex-col items-center w-full max-w-[280px] mx-auto">
          <DialogDescription className="mb-4 text-xs font-medium text-muted-foreground/90 leading-relaxed">
            {t('storageCleaner:confirmDesc')}
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
              {t('storageCleaner:irreversible')}
            </span>
          </div>
        </div>

        {/* 底部操作按钮区：
          💡 修复要点：
          - 增加 pt-2 隔开上方危险条。
          - 显式通过 w-full 配合 flex-col 铺满，在移动端/窄插件下垂直堆叠，最符合小屏直觉。
        */}
        <DialogFooter className="flex flex-col gap-2 w-full pt-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            className="w-full text-xs font-bold shadow-sm h-9"
          >
            {t('storageCleaner:confirmAction')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="w-full text-xs font-semibold shadow-sm h-9 text-muted-foreground hover:text-foreground"
          >
            {t('common_buttons_cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default StorageCleanerConfirm;
