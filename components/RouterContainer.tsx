import { Box, CircularProgress } from '@mui/material';
import { FEATURES, getEntryPointType } from '@/config/features';
import { useRouter } from '@/providers/RouterProvider';
import { Suspense, useMemo } from 'react';

export default function RouterContainer() {
  const { currentPage, isLoaded } = useRouter();

  const animationClass = useMemo(() => {
    return currentPage === 'dashboard' ? 'page-transition-dashboard' : 'page-transition-enter';
  }, [currentPage]);

  const entryPointType = useMemo(() => {
    return getEntryPointType();
  }, []);

  if (!isLoaded) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <CircularProgress size={32} />
      </Box>
    );
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
      <Suspense
        fallback={
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
              minHeight: 200,
            }}
          >
            <CircularProgress size={32} />
          </Box>
        }
      >
        {Component && <Component />}
      </Suspense>
    </Box>
  );
}
