import { useMemo } from 'react';
import { useRouter } from '@/providers/RouterProvider';
import type { PageType } from '@/types/storage';
import { resolveNavFeatures, type NavFeatureItem } from './resolveNavFeatures';

export interface UseFeatureNavReturn {
  navItems: NavFeatureItem[];
  currentPage: PageType;
  navigateTo: (page: PageType) => void;
}

export function useFeatureNav(): UseFeatureNavReturn {
  const { currentPage, pageOrder, visiblePages, navigateTo } = useRouter();

  const navItems = useMemo(
    () => resolveNavFeatures(pageOrder, visiblePages),
    [pageOrder, visiblePages],
  );

  return { navItems, currentPage, navigateTo };
}
