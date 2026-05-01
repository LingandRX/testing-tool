import React, { ReactNode } from 'react';
import type { PageType } from '@/types/storage';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StorageIcon from '@mui/icons-material/Storage';
import LanguageIcon from '@mui/icons-material/Language';
import QrCodeIcon from '@mui/icons-material/QrCode';

import DashboardPage from '@/entrypoints/popup/pages/DashboardPage';
import TimestampPage from '@/entrypoints/popup/pages/TimestampPage';
import StorageCleanerPage from '@/entrypoints/popup/pages/StorageCleanerPage';
import OpenUrlPage from '@/entrypoints/popup/pages/OpenUrlPage';
import QrCodePage from '@/entrypoints/popup/pages/QrCodePage';

import { THEME_COLORS } from './pageTheme';

/**
 * 功能配置接口
 *
 * 整合了路由信息和仪表盘卡片元数据，作为功能的单一事实来源
 */
export interface FeatureConfig {
  /** 页面类型标识 */
  key: PageType;
  /** 功能名称（用于路由标签和卡片标题） */
  label: string;
  /** 功能描述（用于仪表盘卡片） */
  description: string;
  /** 主题颜色（用于仪表盘卡片） */
  themeColor?: string;
  /** 图标组件（用于仪表盘卡片） */
  icon?: ReactNode;
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

export const FEATURES: FeatureConfig[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    description: '',
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
    description: 'Unix 毫秒数转换与格式化',
    themeColor: THEME_COLORS.primary,
    icon: <AccessTimeIcon sx={{ fontSize: 20 }} />,
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
    description: '清理缓存、Cookies 及本地存储',
    themeColor: THEME_COLORS.warning,
    icon: <StorageIcon sx={{ fontSize: 20 }} />,
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
    description: '打开当前选中的 URL',
    themeColor: THEME_COLORS.purple,
    icon: <LanguageIcon sx={{ fontSize: 20 }} />,
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
    description: '生成当前选中的 URL 的二维码',
    themeColor: THEME_COLORS.success,
    icon: <QrCodeIcon sx={{ fontSize: 20 }} />,
    defaultVisible: true,
    components: {
      popup: QrCodePage,
      sidepanel: QrCodePage,
      detached: QrCodePage,
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
  return FEATURES.filter((f) => f.key !== 'dashboard' && f.key !== 'openUrlViewer').map(
    (f) => f.key,
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
