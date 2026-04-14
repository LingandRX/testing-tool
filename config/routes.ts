import type { PageType } from '@/types/storage';
import TimestampPage from '@/entrypoints/popup/pages/TimestampPage';
import StorageCleanerPage from '@/entrypoints/popup/pages/StorageCleanerPage';
import OpenUrlPage from '@/entrypoints/popup/pages/OpenUrlPage';
import OpenUrlViewerPage from '@/entrypoints/popup/pages/OpenUrlViewerPage';

export interface RouteConfig {
  key: PageType;
  label: string;
  defaultVisible: boolean;
  component: React.ComponentType;
}

export const ROUTES: RouteConfig[] = [
  {
    key: 'timestamp',
    label: '时间戳',
    defaultVisible: true,
    component: TimestampPage,
  },
  {
    key: 'storageCleaner',
    label: '存储清理',
    defaultVisible: true,
    component: StorageCleanerPage,
  },
  {
    key: 'openUrl',
    label: 'Open Url',
    defaultVisible: true,
    component: OpenUrlPage,
  },
  {
    key: 'openUrlViewer',
    label: '查看',
    defaultVisible: false,
    component: OpenUrlViewerPage,
  },
];

export function getRouteByKey(key: PageType): RouteConfig | undefined {
  return ROUTES.find(route => route.key === key);
}

export function getDefaultVisibleRoutes(): PageType[] {
  return ROUTES.filter(route => route.defaultVisible).map(route => route.key);
}

export function getAllRouteKeys(): PageType[] {
  return ROUTES.map(route => route.key);
}
