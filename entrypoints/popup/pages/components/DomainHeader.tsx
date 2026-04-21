import { Box, Stack, Typography } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import { formatSize } from '@/utils/storageCleaner';
import { storageCleanerPageStyles } from '@/config/pageTheme';

interface DomainHeaderProps {
  domain: string;
  totalSize: number;
}

export default function DomainHeader({ domain, totalSize }: DomainHeaderProps) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
      <Box
        sx={{
          p: 1.2,
          borderRadius: 3,
          bgcolor: 'rgba(255, 152, 0, 0.1)',
          color: storageCleanerPageStyles.warningColor,
          display: 'flex',
          boxShadow: '0 2px 8px rgba(255, 152, 0, 0.15)',
          transition: 'all 0.2s',
          '&:hover': {
            bgcolor: 'rgba(255, 152, 0, 0.15)',
            transform: 'scale(1.05)',
          },
        }}
      >
        <StorageIcon sx={{ fontSize: 22 }} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            variant="h6"
            fontWeight={900}
            sx={{
              letterSpacing: '-0.5px',
              lineHeight: 1.2,
              fontSize: '1rem',
              color: 'text.primary',
            }}
          >
            存储清理
          </Typography>
          {totalSize > 0 && (
            <Box
              sx={{
                bgcolor: 'rgba(255, 152, 0, 0.15)',
                color: storageCleanerPageStyles.warningColor,
                px: 1.5,
                py: 0.3,
                borderRadius: 2,
                fontWeight: 800,
                fontSize: '0.7rem',
                boxShadow: '0 2px 4px rgba(255, 152, 0, 0.2)',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'rgba(255, 152, 0, 0.25)',
                },
              }}
            >
              已占用 {formatSize(totalSize)}
            </Box>
          )}
        </Stack>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontWeight: 600,
            display: 'block',
            maxWidth: 240,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mt: 0.3,
            fontSize: '0.75rem',
          }}
        >
          {domain || '加载中...'}
        </Typography>
      </Box>
    </Stack>
  );
}
