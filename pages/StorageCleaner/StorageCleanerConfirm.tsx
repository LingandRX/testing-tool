import {
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import type { StorageCleanerOptions } from '@/types/storage';
import Button from '@/components/Button';
import { storageCleanerPageStyles } from '@/config/pageTheme';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation(['storageCleaner']);

  const selectedOptions = Object.entries(options)
    .filter(([_, value]) => value)
    .map(([key, _]) => t(`storageCleaner:options.${key as keyof StorageCleanerOptions}`));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: storageCleanerPageStyles.CONFIRM_DIALOG_PAPER,
        },
      }}
    >
      <DialogTitle sx={storageCleanerPageStyles.CONFIRM_DIALOG_TITLE}>
        {t('storageCleaner:confirmTitle')}
      </DialogTitle>

      <DialogContent sx={storageCleanerPageStyles.CONFIRM_DIALOG_CONTENT}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={storageCleanerPageStyles.CONFIRM_DIALOG_DESC}
        >
          {t('storageCleaner:confirmDesc')}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, justifyContent: 'center', mb: 4 }}>
          {selectedOptions.map((label) => (
            <Chip
              key={label}
              label={label}
              size="small"
              sx={storageCleanerPageStyles.CONFIRM_DIALOG_CHIP}
            />
          ))}
        </Box>

        <Box sx={storageCleanerPageStyles.CONFIRM_DIALOG_WARNING_BOX}>
          <Typography variant="caption" sx={storageCleanerPageStyles.CONFIRM_DIALOG_WARNING_TEXT}>
            <span role="img" aria-label="warning">
              ⚠️
            </span>{' '}
            {t('storageCleaner:irreversible')}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1, gap: 2 }}>
        <Button
          variant="text"
          onClick={onClose}
          fullWidth
          sx={storageCleanerPageStyles.CONFIRM_DIALOG_CANCEL}
        >
          {t('common:buttons.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          fullWidth
          sx={storageCleanerPageStyles.CONFIRM_DIALOG_CONFIRM}
        >
          {t('storageCleaner:confirmAction')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default StorageCleanerConfirm;
