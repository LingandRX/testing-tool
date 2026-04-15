import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Chip,
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
  const selectedOptions = Object.entries(options)
    .filter(([_, value]) => value)
    .map(([key, _]) => key);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 5,
            backgroundImage: 'none',
            boxShadow: '0 24px 48px -12px rgba(0,0,0,0.15)',
            p: 1
          },
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pt: 3, pb: 1, fontWeight: 900, letterSpacing: '-0.5px', fontSize: '1.25rem' }}>
        确认清理数据？
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
          您将清除当前页面的选定存储项。
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mb: 3 }}>
          {selectedOptions.map((opt) => (
            <Chip 
              key={opt} 
              label={opt} 
              size="small" 
              sx={{ 
                bgcolor: 'grey.50', 
                fontWeight: 600, 
                color: 'text.secondary',
                fontSize: '0.7rem',
                border: '1px solid',
                borderColor: 'grey.200'
              }} 
            />
          ))}
        </Box>

        <Typography variant="caption" sx={{ color: '#ff9800', fontWeight: 700, bgcolor: '#fff4e5', px: 1.5, py: 0.5, borderRadius: 2 }}>
          ⚠️ 此操作不可撤销
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
        <Button 
          variant="text" 
          onClick={onClose} 
          fullWidth
          sx={{ fontWeight: 700, color: 'text.secondary', borderRadius: 3 }}
        >
          取消
        </Button>
        <Button 
          variant="contained" 
          onClick={onConfirm} 
          fullWidth
          sx={{ 
            bgcolor: '#ff9800', 
            '&:hover': { bgcolor: '#f57c00' },
            fontWeight: 800,
            borderRadius: 3,
            boxShadow: 'none'
          }}
        >
          确认清理
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default StorageCleanerConfirm;
