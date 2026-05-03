import { Box, Container, Typography } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

interface ErrorDisplayProps {
  error: string;
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <Container
      sx={{
        py: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: { xs: 'auto', sm: '400px' },
        textAlign: 'center',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 320 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
            p: 4,
            boxShadow: '0 8px 24px rgba(244, 67, 54, 0.15)',
            border: '1px solid rgba(244, 67, 54, 0.2)',
            bgcolor: 'rgba(244, 67, 54, 0.05)',
          }}
        >
          <WarningIcon sx={{ fontSize: 36, color: 'error.main', mb: 2 }} />
          <Typography
            variant="body1"
            color="error.main"
            sx={{
              fontSize: '0.9rem',
              fontWeight: 700,
              lineHeight: 1.4,
              mb: 3,
            }}
          >
            {error}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            存储清理功能仅适用于标准网页
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
