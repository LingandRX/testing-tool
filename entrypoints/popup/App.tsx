import RouterProvider from '@/providers/RouterProvider';
import TopBar from '@/components/TopBar';
import RouterContainer from '@/components/RouterContainer';
import { globalStyles } from '@/config/pageTheme';
import { Box } from '@mui/material';

export default function App() {
  // 打开Chrome扩展选项页面，需确保manifest中已配置options_page或options_ui
  const handleOpenOptions = () => {
    chrome.runtime
      .openOptionsPage()
      .then(() => {
        console.log('Options page opened.');
      })
      .catch(() => {
        console.error('Failed to open options page.');
      });
  };

  return (
    <RouterProvider defaultRoute="dashboard" syncRoute={true} syncKey="app/popupRoute">
      <Box
        className="app"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '400px',
          height: '600px',
          overflow: 'hidden',
          backgroundColor: globalStyles.backgroundColor,
          // 独立窗口全屏自适应
          '@media screen and (min-width: 401px), screen and (min-height: 601px)': {
            width: '100vw',
            height: '100vh',
            minWidth: '400px',
            minHeight: '600px',
          },
        }}
      >
        <TopBar onOpenOptions={handleOpenOptions} />
        <RouterContainer />
      </Box>
    </RouterProvider>
  );
}
