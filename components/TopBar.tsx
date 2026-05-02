import { Box, IconButton, Typography, Stack, Tooltip } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useRouter } from '@/providers/RouterProvider';

export default function TopBar({ onOpenOptions }: { onOpenOptions: () => void }) {
  const { currentPage, goBack } = useRouter();

  const handleOpenInTab = () => {
    // 在新标签页中打开扩展页面
    chrome.tabs.create({ url: chrome.runtime.getURL('popup.html?mode=tab') }).catch(console.error);
    window.close();
  };

  const isDashboard = currentPage === 'dashboard';

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        px: { xs: 1.5, sm: 2 },
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'grey.100',
        bgcolor: 'background.paper',
        zIndex: 1100,
      }}
    >
      <Box sx={{ width: { xs: 32, sm: 40 } }}>
        {!isDashboard && (
          <IconButton
            size="small"
            onClick={goBack}
            sx={{
              bgcolor: 'grey.50',
              '&:hover': { bgcolor: 'grey.200' },
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
          color: 'text.secondary',
        }}
      >
        Testing Tools
      </Typography>

      <Stack
        direction="row"
        spacing={0.5}
        sx={{ width: { xs: 80, sm: 120 }, justifyContent: 'flex-end' }}
      >
        <Tooltip title="在标签页打开">
          <IconButton size="small" onClick={handleOpenInTab}>
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
