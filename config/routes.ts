import type { PageType } from '@/types/storage';
import DashboardPage from '@/entrypoints/popup/pages/DashboardPage';
import TimestampPage from '@/entrypoints/popup/pages/TimestampPage';
import StorageCleanerPage from '@/entrypoints/popup/pages/StorageCleanerPage';
import OpenUrlPage from '@/entrypoints/popup/pages/OpenUrlPage';
import OpenUrlViewerPage from '@/entrypoints/popup/pages/OpenUrlViewerPage';
import QrCodePage from '@/entrypoints/popup/pages/QrCodePage';
import FormRecognizerPage from '@/entrypoints/popup/pages/FormRecognizerPage';
import FormFillSidePanel from '@/entrypoints/sidepanel/pages/FormFillSidePanel';

export interface RouteConfig {
  key: PageType;
  label: string;
  defaultVisible: boolean;
  components: {
    popup: React.ComponentType;
    sidepanel: React.ComponentType;
    detached: React.ComponentType;
  };
}

export const ROUTES: RouteConfig[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    defaultVisible: true,
    components: {
      popup: DashboardPage,
      sidepanel: DashboardPage,
      detached: DashboardPage,
    },
  },
  {
    key: 'timestamp',
    label: '时间戳',
    defaultVisible: true,
    components: {
      popup: TimestampPage,
      sidepanel: TimestampPage,
      detached: TimestampPage,
    },
  },
  {
    key: 'storageCleaner',
    label: '存储清理',
    defaultVisible: true,
    components: {
      popup: StorageCleanerPage,
      sidepanel: StorageCleanerPage,
      detached: StorageCleanerPage,
    },
  },
  {
    key: 'openUrl',
    label: 'Open Url',
    defaultVisible: true,
    components: {
      popup: OpenUrlPage,
      sidepanel: OpenUrlPage,
      detached: OpenUrlPage,
    },
  },
  {
    key: 'qrCode',
    label: '二维码工具',
    defaultVisible: true,
    components: {
      popup: QrCodePage,
      sidepanel: QrCodePage,
      detached: QrCodePage,
    },
  },
  {
    key: 'formRecognizer',
    label: '表单识别',
    defaultVisible: true,
    components: {
      popup: FormRecognizerPage,
      sidepanel: FormFillSidePanel,
      detached: FormRecognizerPage,
    },
  },
  {
    key: 'openUrlViewer',
    label: '查看',
    defaultVisible: false,
    components: {
      popup: OpenUrlViewerPage,
      sidepanel: OpenUrlViewerPage,
      detached: OpenUrlViewerPage,
    },
  },
];

export function getRouteByKey(key: PageType): RouteConfig | undefined {
  return ROUTES.find((route) => route.key === key);
}

export function getDefaultVisibleRoutes(): PageType[] {
  return ROUTES.filter((route) => route.defaultVisible).map((route) => route.key);
}

export function getAllRouteKeys(): PageType[] {
  return ROUTES.map((route) => route.key);
}

export function getDefaultPageOrder(): PageType[] {
  return ROUTES.filter((route) => route.key !== 'dashboard' && route.key !== 'openUrlViewer').map(
    (route) => route.key,
  );
}

export function getEntryPointType(): 'popup' | 'sidepanel' | 'detached' {
  const pathname = window.location.pathname;
  if (pathname.includes('sidepanel')) {
    return 'sidepanel';
  }
  if (new URLSearchParams(window.location.search).get('mode') === 'detached') {
    return 'detached';
  }
  return 'popup';
}
