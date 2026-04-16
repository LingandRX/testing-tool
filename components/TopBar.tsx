import { Box, IconButton, Typography, Stack, Tooltip } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useRouter } from '@/providers/RouterProvider';

export default function TopBar({ onOpenOptions }: { onOpenOptions: () => void }) {
  const { currentPage, goBack } = useRouter();

  const handleDetach = () => {
    // 弹出脱离窗口 (以独立面板形式打开当前 URL)
    chrome.windows.create({
      url: window.location.href,
      type: 'panel',
      width: 420,
      height: 600
    });
  };

  const isDashboard = currentPage === 'dashboard';

  return (
    <Stack 
      direction="row" 
      justifyContent="space-between" 
      alignItems="center" 
      sx={{ 
        px: 2, 
        py: 1.5, 
        borderBottom: '1px solid',
        borderColor: 'grey.100',
        bgcolor: 'background.paper',
        zIndex: 1100
      }}
    >
      <Box sx={{ width: 40 }}>
        {!isDashboard && (
          <IconButton 
            size="small" 
            onClick={goBack}
            sx={{ 
              bgcolor: 'grey.50',
              '&:hover': { bgcolor: 'grey.200' }
            }}
          >
            <ArrowBackIosNewIcon sx={{ fontSize: 14 }} />
          </IconButton>
        )}
      </Box>

      <Typography 
        variant="subtitle2" 
        sx={{ 
          fontWeight: 800, 
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          color: 'text.secondary'
        }}
      >
        Testing Tools
      </Typography>

      <Stack direction="row" spacing={1} sx={{ width: 80, justifyContent: 'flex-end' }}>
        <Tooltip title="独立窗口模式">
          <IconButton size="small" onClick={handleDetach}>
            <OpenInNewIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="设置">
          <IconButton size="small" onClick={onOpenOptions}>
            <SettingsIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
}
