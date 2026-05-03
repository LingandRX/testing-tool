import { Box, Switch, Typography } from '@mui/material';

interface AutoRefreshToggleProps {
  autoRefresh: boolean;
  onChange: (checked: boolean) => void;
}

export default function AutoRefreshToggle({ autoRefresh, onChange }: AutoRefreshToggleProps) {
  return (
    <Box
      sx={{
        mb: 3,
        p: 1.5,
        borderRadius: 4,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'grey.100',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8rem', px: 1.2 }}>
        清理后自动刷新页面
      </Typography>
      <Switch
        size="small"
        checked={autoRefresh}
        onChange={(e) => onChange(e.target.checked)}
        color="warning"
        sx={{
          '& .MuiSwitch-track': {
            borderRadius: 20,
          },
          '& .MuiSwitch-thumb': {
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.2s',
          },
          '&:hover .MuiSwitch-thumb': {
            transform: 'scale(1.1)',
          },
        }}
      />
    </Box>
  );
}
