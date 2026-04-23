import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Chip,
  alpha,
} from '@mui/material';
import type { StorageCleanerOptions } from '@/types/storage';
import Button from '@/components/Button';
import { THEME_COLORS } from '@/config/pageTheme';

export interface StorageCleanerConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  options: StorageCleanerOptions;
}

const STORAGE_LABELS: Record<keyof StorageCleanerOptions, string> = {
  localStorage: 'LocalStorage',
  sessionStorage: 'Session Storage',
  indexedDB: 'IndexedDB',
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
    .map(([key, _]) => STORAGE_LABELS[key as keyof StorageCleanerOptions] || key);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 6,
            backgroundImage: 'none',
            boxShadow: `0 24px 64px -12px ${alpha(THEME_COLORS.black, 0.18)}`,
            p: 1.5,
            bgcolor: 'background.paper',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          pt: 4,
          pb: 1,
          fontWeight: 900,
          letterSpacing: '-0.5px',
          fontSize: '1.35rem',
          color: 'text.primary',
        }}
      >
        确认清理数据？
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3.5, fontWeight: 500, fontSize: '0.9rem' }}
        >
          您将永久删除当前页面的以下选定存储项。
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, justifyContent: 'center', mb: 4 }}>
          {selectedOptions.map((label) => (
            <Chip
              key={label}
              label={label}
              size="small"
              sx={{
                bgcolor: alpha(THEME_COLORS.warning, 0.04),
                fontWeight: 700,
                color: THEME_COLORS.warning,
                fontSize: '0.75rem',
                border: '1px solid',
                borderColor: alpha(THEME_COLORS.warning, 0.15),
                borderRadius: 2.5,
                height: 'auto',
                '& .MuiChip-label': { px: 1.2, py: 0.6 },
              }}
            />
          ))}
        </Box>

        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: alpha(THEME_COLORS.error, 0.05),
            color: THEME_COLORS.error,
            px: 2,
            py: 0.8,
            borderRadius: 3,
            border: '1px dashed',
            borderColor: alpha(THEME_COLORS.error, 0.2),
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.75rem',
            }}
          >
            <span role="img" aria-label="warning">
              ⚠️
            </span>{' '}
            此操作不可撤销
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1, gap: 2 }}>
        <Button
          variant="text"
          onClick={onClose}
          fullWidth
          sx={{
            fontWeight: 700,
            color: 'text.secondary',
            borderRadius: 4,
            fontSize: '0.95rem',
            '&:hover': {
              bgcolor: 'grey.100',
              color: 'text.primary',
            },
          }}
        >
          取消
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          fullWidth
          sx={{
            bgcolor: THEME_COLORS.warning,
            fontWeight: 800,
            borderRadius: 4,
            fontSize: '0.95rem',
            boxShadow: `0 8px 20px ${alpha(THEME_COLORS.warning, 0.25)}`,
            '&:hover': {
              bgcolor: THEME_COLORS.warningDark,
              boxShadow: `0 12px 28px ${alpha(THEME_COLORS.warning, 0.35)}`,
              transform: 'translateY(-2px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          }}
        >
          确认清理
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default StorageCleanerConfirm;
