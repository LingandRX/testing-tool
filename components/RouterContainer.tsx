import { Box } from '@mui/material';
import { ROUTES, getEntryPointType } from '@/config/routes';
import { useRouter } from '@/providers/RouterProvider';
import { useMemo } from 'react';

export default function RouterContainer() {
  const { currentPage, isLoaded } = useRouter();

  const animationClass = useMemo(() => {
    return currentPage === 'dashboard' ? 'page-transition-dashboard' : 'page-transition-enter';
  }, [currentPage]);

  const entryPointType = useMemo(() => {
    return getEntryPointType();
  }, []);

  if (!isLoaded) {
    return <div className="app">Loading...</div>;
  }

  const currentRoute = ROUTES.find((route) => route.key === currentPage);
  const Component = currentRoute ? currentRoute.components[entryPointType] : null;

  return (
    <Box
      key={currentPage} // Trigger animation on navigation
      className={animationClass}
      sx={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollbarGutter: 'stable',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {Component && <Component />}
    </Box>
  );
}
