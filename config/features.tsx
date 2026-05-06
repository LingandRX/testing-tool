import { type ComponentType, lazy, ReactNode } from 'react';
import type { PageType } from '@/types/storage';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StorageIcon from '@mui/icons-material/Storage';
import QrCodeIcon from '@mui/icons-material/QrCode';
import DescriptionIcon from '@mui/icons-material/Description';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

import { THEME_COLORS } from './pageTheme';

// 懒加载页面组件
const DashboardPage = lazy(() => import('@/pages/Dashboard'));
const TimestampPage = lazy(() => import('../pages/Timestamp'));
const StorageCleanerPage = lazy(() => import('../pages/StorageCleaner'));
const QrCodePage = lazy(() => import('../pages/QrCode'));
const TextStatisticsPage = lazy(() => import('../pages/TextStatistics'));
const JwtPage = lazy(() => import('../pages/Jwt'));

/**
 * 功能配置接口
 *
 * 整合了路由信息和仪表盘卡片元数据，作为功能的单一事实来源
 */
export interface FeatureConfig {
  /** 页面类型标识 */
  key: PageType;
  /** 功能名称翻译键 */
  labelKey: string;
  /** 功能描述翻译键 */
  descriptionKey: string;
  /** 主题颜色（用于仪表盘卡片） */
  themeColor?: string;
  /** 图标组件（用于仪表盘卡片） */
  icon?: ReactNode;
  /** 默认是否在仪表盘显示 */
  defaultVisible: boolean;
  /** 不同显示模式对应的组件 */
  components: {
    /** 弹窗模式组件 */
    popup: ComponentType;
    /** 侧边栏模式组件 */
    sidepanel: ComponentType;
    /** 标签页模式组件 */
    tab: ComponentType;
  };
}

export const FEATURES: FeatureConfig[] = [
  {
    key: 'dashboard',
    labelKey: 'features:dashboard.title',
    descriptionKey: '',
    defaultVisible: true,
    components: {
      popup: DashboardPage,
      sidepanel: DashboardPage,
      tab: DashboardPage,
    },
  },
  {
    key: 'timestamp',
    labelKey: 'features:timestamp.title',
    descriptionKey: 'features:timestamp.description',
    themeColor: THEME_COLORS.primary,
    icon: <AccessTimeIcon sx={{ fontSize: 20 }} />,
    defaultVisible: true,
    components: {
      popup: TimestampPage,
      sidepanel: TimestampPage,
      tab: TimestampPage,
    },
  },
  {
    key: 'storageCleaner',
    labelKey: 'features:storageCleaner.title',
    descriptionKey: 'features:storageCleaner.description',
    themeColor: THEME_COLORS.warning,
    icon: <StorageIcon sx={{ fontSize: 20 }} />,
    defaultVisible: true,
    components: {
      popup: StorageCleanerPage,
      sidepanel: StorageCleanerPage,
      tab: StorageCleanerPage,
    },
  },
  {
    key: 'qrCode',
    labelKey: 'features:qrCode.title',
    descriptionKey: 'features:qrCode.description',
    themeColor: THEME_COLORS.success,
    icon: <QrCodeIcon sx={{ fontSize: 20 }} />,
    defaultVisible: true,
    components: {
      popup: QrCodePage,
      sidepanel: QrCodePage,
      tab: QrCodePage,
    },
  },
  {
    key: 'textStatistics',
    labelKey: 'features:textStatistics.title',
    descriptionKey: 'features:textStatistics.description',
    themeColor: THEME_COLORS.purple,
    icon: <DescriptionIcon sx={{ fontSize: 20 }} />,
    defaultVisible: true,
    components: {
      popup: TextStatisticsPage,
      sidepanel: TextStatisticsPage,
      tab: TextStatisticsPage,
    },
  },
  {
    key: 'jwt',
    labelKey: 'features:jwt.title',
    descriptionKey: 'features:jwt.description',
    themeColor: THEME_COLORS.indigo,
    icon: <VpnKeyIcon sx={{ fontSize: 20 }} />,
    defaultVisible: true,
    components: {
      popup: JwtPage,
      sidepanel: JwtPage,
      tab: JwtPage,
    },
  },
];

export function getFeatureByKey(key: PageType): FeatureConfig | undefined {
  return FEATURES.find((f) => f.key === key);
}

export function getDefaultVisibleFeatureKeys(): PageType[] {
  return FEATURES.filter((f) => f.defaultVisible).map((f) => f.key);
}

export function getAllFeatureKeys(): PageType[] {
  return FEATURES.map((f) => f.key);
}

export function getDefaultPageOrder(): PageType[] {
  return FEATURES.filter((f) => f.key !== 'dashboard').map((f) => f.key);
}

export function getEntryPointType(): 'popup' | 'sidepanel' | 'tab' {
  const pathname = window.location.pathname;
  if (pathname.includes('sidepanel')) {
    return 'sidepanel';
  }
  if (new URLSearchParams(window.location.search).get('mode') === 'tab') {
    return 'tab';
  }
  return 'popup';
}
