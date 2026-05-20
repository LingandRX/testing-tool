import { Box } from '@mui/material';
import { FEATURES, getEntryPointType } from '@/config/features';
import { useRouter } from '@/providers/RouterProvider';
import { Suspense, useMemo } from 'react';
import PageErrorBoundary from '@/components/PageErrorBoundary';
import PageSkeleton from '@/components/PageSkeleton';

export default function RouterContainer() {
  const { currentPage, isLoaded } = useRouter();

  const animationClass = useMemo(() => {
    return currentPage === 'dashboard' ? 'page-transition-dashboard' : 'page-transition-enter';
  }, [currentPage]);

  const entryPointType = useMemo(() => {
    return getEntryPointType();
  }, []);

  if (!isLoaded) {
    return <PageSkeleton variant={currentPage === 'dashboard' ? 'dashboard' : 'tool'} />;
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
        fallback={<PageSkeleton variant={currentPage === 'dashboard' ? 'dashboard' : 'tool'} />}
      >
        <PageErrorBoundary resetKey={currentPage}>{Component && <Component />}</PageErrorBoundary>
      </Suspense>
    </Box>
  );
}
