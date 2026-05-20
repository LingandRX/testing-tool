/**
 * PageSkeleton 组件 - 页面加载骨架屏
 *
 * 用于 Suspense fallback 和初始加载状态，提供平滑的视觉过渡
 * 避免白屏闪烁，减少布局偏移
 */
import { Box, Skeleton, Stack, useTheme } from '@mui/material';
import { alpha } from '@mui/material';

interface PageSkeletonProps {
  /** 骨架屏类型 */
  variant?: 'dashboard' | 'tool';
}

/**
 * 仪表盘卡片骨架屏
 */
function DashboardCardSkeleton() {
  const theme = useTheme();
  const borderColor = alpha(theme.palette.divider, 0.5);

  return (
    <Box
      sx={{
        borderRadius: 4,
        border: '1px solid',
        borderColor,
        p: 2.5,
        height: 100,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 3 }} />
          <Box>
            <Skeleton variant="text" width={100} height={20} />
            <Skeleton variant="text" width={140} height={14} sx={{ mt: 0.5 }} />
          </Box>
        </Stack>
        <Skeleton variant="circular" width={12} height={12} />
      </Stack>
    </Box>
  );
}

/**
 * 工具页面骨架屏
 */
function ToolPageSkeleton() {
  return (
    <Box sx={{ p: 2.5 }}>
      {/* 标题区域 */}
      <Skeleton variant="text" width={180} height={28} sx={{ mb: 2 }} />

      {/* 输入区域 */}
      <Skeleton variant="rounded" width="100%" height={120} sx={{ borderRadius: 3, mb: 2 }} />

      {/* 控制栏 */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Skeleton variant="rounded" width={100} height={36} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rounded" width={80} height={36} sx={{ borderRadius: 2 }} />
        <Box sx={{ flex: 1 }} />
        <Skeleton variant="rounded" width={90} height={36} sx={{ borderRadius: 2 }} />
      </Stack>

      {/* 结果区域 */}
      <Skeleton variant="rounded" width="100%" height={160} sx={{ borderRadius: 3 }} />
    </Box>
  );
}

/**
 * 页面加载骨架屏
 *
 * @param props - PageSkeletonProps
 * @returns 骨架屏 JSX 元素
 */
export default function PageSkeleton({ variant = 'dashboard' }: PageSkeletonProps) {
  if (variant === 'tool') {
    return <ToolPageSkeleton />;
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(auto-fill, minmax(300px, 1fr))',
        },
        gridAutoRows: '1fr',
        gap: 2,
        p: 2,
      }}
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <DashboardCardSkeleton key={index} />
      ))}
    </Box>
  );
}

PageSkeleton.displayName = 'PageSkeleton';
