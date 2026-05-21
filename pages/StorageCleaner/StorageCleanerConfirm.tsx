import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { StorageCleanerOptions } from '@/types/storage';
import { useLazyTranslation } from '@/utils/useLazyTranslation';

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
  const { t } = useLazyTranslation('storageCleaner');

  const selectedOptions = Object.entries(options)
    .filter(([_, value]) => value)
    .map(([key, _]) => t(`storageCleaner:options.${key as keyof StorageCleanerOptions}`));

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[400px] p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold tracking-tight">
            {t('storageCleaner:confirmTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="text-center">
          <DialogDescription className="mb-4 text-sm font-medium text-muted-foreground">
            {t('storageCleaner:confirmDesc')}
          </DialogDescription>

          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {selectedOptions.map((label) => (
              <span
                key={label}
                className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 border border-dashed border-red-200">
            <span className="text-xs font-bold text-red-600 flex items-center gap-1">
              <span role="img" aria-label="warning">
                ⚠️
              </span>{' '}
              {t('storageCleaner:irreversible')}
            </span>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            {t('common:buttons.cancel')}
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white"
          >
            {t('storageCleaner:confirmAction')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default StorageCleanerConfirm;
