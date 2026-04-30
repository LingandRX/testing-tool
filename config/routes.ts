import type { PageType } from '@/types/storage';
import DashboardPage from '@/entrypoints/popup/pages/DashboardPage';
import TimestampPage from '@/entrypoints/popup/pages/TimestampPage';
import StorageCleanerPage from '@/entrypoints/popup/pages/StorageCleanerPage';
import OpenUrlPage from '@/entrypoints/popup/pages/OpenUrlPage';
import OpenUrlViewerPage from '@/entrypoints/popup/pages/OpenUrlViewerPage';
import QrCodePage from '@/entrypoints/popup/pages/QrCodePage';
import FormRecognizerPage from '@/entrypoints/popup/pages/FormRecognizerPage';
import FormMappingPage from '@/entrypoints/popup/pages/FormMappingPage';
import FormFillPage from '@/entrypoints/popup/pages/FormFillPage';

/**
 * 路由配置接口
 *
 * 定义每个页面路由的配置信息，支持多种显示模式（popup、sidepanel、detached）
 */
export interface RouteConfig {
  /** 页面类型标识 */
  key: PageType;
  /** 页面显示标签 */
  label: string;
  /** 默认是否在仪表盘显示 */
  defaultVisible: boolean;
  /** 不同显示模式对应的组件 */
  components: {
    /** 弹窗模式组件 */
    popup: React.ComponentType;
    /** 侧边栏模式组件 */
    sidepanel: React.ComponentType;
    /** 独立窗口模式组件 */
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
    key: 'formMapping',
    label: '表单映射',
    defaultVisible: true,
    components: {
      popup: FormMappingPage,
      sidepanel: FormMappingPage,
      detached: FormMappingPage,
    },
  },
  {
    key: 'formFill',
    label: '智能填充',
    defaultVisible: true,
    components: {
      popup: FormFillPage,
      sidepanel: FormFillPage,
      detached: FormFillPage,
    },
  },
  {
    key: 'formRecognizer',
    label: '表单识别',
    defaultVisible: true,
    components: {
      popup: FormRecognizerPage,
      sidepanel: FormRecognizerPage,
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
