import { Box } from '@mui/material';
import { ROUTES } from '@/config/routes';
import { useRouter } from '@/providers/RouterProvider';

export default function RouterContainer() {
  const { currentPage, isLoaded } = useRouter();

  if (!isLoaded) {
    return <div className="app">Loading...</div>;
  }

  const currentRoute = ROUTES.find(route => route.key === currentPage);

  return (
    <div className="app">
      {/* NavigationBar is rendered separately to allow handling onOpenOptions */}
      {/* 统一滚动容器 */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          scrollbarGutter: 'stable',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {currentRoute && <currentRoute.component />}
      </Box>
    </div>
  );
}
