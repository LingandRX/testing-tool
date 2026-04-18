import type { PageType } from '@/types/storage';
import DashboardPage from '@/entrypoints/popup/pages/DashboardPage';
import TimestampPage from '@/entrypoints/popup/pages/TimestampPage';
import StorageCleanerPage from '@/entrypoints/popup/pages/StorageCleanerPage';
import OpenUrlPage from '@/entrypoints/popup/pages/OpenUrlPage';
import OpenUrlViewerPage from '@/entrypoints/popup/pages/OpenUrlViewerPage';
import QrCodePage from '@/entrypoints/popup/pages/QrCodePage';

export interface RouteConfig {
  key: PageType;
  label: string;
  defaultVisible: boolean;
  component: React.ComponentType;
}

export const ROUTES: RouteConfig[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    defaultVisible: true,
    component: DashboardPage,
  },
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
    key: 'qrCode',
    label: '二维码工具',
    defaultVisible: true,
    component: QrCodePage,
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

export function getDefaultPageOrder(): PageType[] {
  return ROUTES.filter(route => route.key !== 'dashboard' && route.key !== 'openUrlViewer').map(route => route.key);
}
