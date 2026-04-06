import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
} from '@mui/material';
import type { StorageCleanerOptions } from '@/types/storage';
import Button from '@/components/Button';

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
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            backgroundImage: 'none',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          },
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1, pt: 3, fontWeight: 700 }}>
        确认清理
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          将清理以下存储类型：
        </Typography>
        <Box
          sx={{
            bgcolor: 'grey.50',
            borderRadius: 3,
            p: 2,
            mb: 2,
            display: 'inline-block',
            textAlign: 'left',
            minWidth: '60%',
          }}
        >
          {options.localStorage && <Typography variant="body2">- localStorage</Typography>}
          {options.sessionStorage && <Typography variant="body2">- sessionStorage</Typography>}
          {options.indexedDB && <Typography variant="body2">- IndexedDB</Typography>}
          {options.cookies && <Typography variant="body2">- Cookies</Typography>}
          {options.cacheStorage && <Typography variant="body2">- Cache Storage</Typography>}
          {options.serviceWorkers && <Typography variant="body2">- Service Workers</Typography>}
        </Box>
        <Typography variant="body2" color="text.secondary">
          此操作不可撤销。
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} fullWidth>
          取消
        </Button>
        <Button variant="contained" color="error" onClick={onConfirm} fullWidth>
          确认清理
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default StorageCleanerConfirm;
