import { useMemo } from 'react';
import { useRouter } from '@/providers/RouterProvider';
import type { PageType } from '@/types/storage';
import { resolveDashboardFeatures, type DashboardFeatureItem } from './dashboardFeatures';

export interface UseDashboardReturn {
  visibleFeatures: DashboardFeatureItem[];
  recentFeatures: DashboardFeatureItem[];
  showRecent: boolean;
  navigateTo: (page: PageType) => void;
}

export function useDashboard(): UseDashboardReturn {
  const { navigateTo, visiblePages, pageOrder, recentlyUsedTools } = useRouter();

  const visibleFeatures = useMemo(
    () => resolveDashboardFeatures(pageOrder, visiblePages),
    [pageOrder, visiblePages],
  );

  const recentFeatures = useMemo(
    () => resolveDashboardFeatures(recentlyUsedTools, visiblePages),
    [recentlyUsedTools, visiblePages],
  );

  const showRecent = recentFeatures.length > 0;

  return { visibleFeatures, recentFeatures, showRecent, navigateTo };
}
