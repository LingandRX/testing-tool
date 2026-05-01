import { Box } from '@mui/material';
import { FEATURES, getEntryPointType } from '@/config/features';
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

  const currentFeature = FEATURES.find((f) => f.key === currentPage);
  const Component = currentFeature ? currentFeature.components[entryPointType] : null;

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
