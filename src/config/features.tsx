import { type ComponentType, lazy } from 'react';
import type { LucideProps } from 'lucide-react';
import type { PageType } from '@/types/storage';
import {
  Clock,
  Database,
  QrCode,
  FileText,
  Key,
  GitCompareArrows,
  ArrowLeftRight,
  MousePointerClick,
  FileSpreadsheet,
} from 'lucide-react';

export type PaletteColorKey = 'primary' | 'success' | 'warning' | 'error' | 'secondary' | 'info';

// 懒加载页面组件
const DashboardPage = lazy(() => import('@/pages/Dashboard'));
const TimestampPage = lazy(() => import('@/pages/Timestamp'));
const StorageCleanerPage = lazy(() => import('@/pages/StorageCleaner'));
const QrCodePage = lazy(() => import('@/pages/QrCode'));
const TextStatisticsPage = lazy(() => import('@/pages/TextStatistics'));
const JwtPage = lazy(() => import('@/pages/Jwt'));
const JsonToolsPage = lazy(() => import('@/pages/JsonTools'));
const Base64ConverterPage = lazy(() => import('@/pages/Base64Converter'));
const RightClickRestorerPage = lazy(() => import('@/pages/RightClickRestorer'));
const TestDataGeneratorPage = lazy(() => import('@/pages/TestDataGenerator'));

export interface FeatureConfig {
  key: PageType;
  label: string;
  description: string;
  themeColorKey?: PaletteColorKey;
  icon?: ComponentType<LucideProps>;
  defaultVisible: boolean;
  component: ComponentType;
}

export const FEATURES: FeatureConfig[] = [
  {
    key: 'dashboard',
    label: '仪表盘',
    description: '',
    defaultVisible: true,
    component: DashboardPage,
  },
  {
    key: 'timestamp',
    label: '时间戳',
    description: 'Unix 毫秒数转换与格式化',
    themeColorKey: 'primary',
    icon: Clock,
    defaultVisible: true,
    component: TimestampPage,
  },
  {
    key: 'storageCleaner',
    label: '存储清理',
    description: '清理缓存、Cookies 及本地存储',
    themeColorKey: 'warning',
    icon: Database,
    defaultVisible: true,
    component: StorageCleanerPage,
  },
  {
    key: 'qrCode',
    label: '二维码工具',
    description: '生成当前选中的 URL 的二维码',
    themeColorKey: 'success',
    icon: QrCode,
    defaultVisible: true,
    component: QrCodePage,
  },
  {
    key: 'textStatistics',
    label: '文本统计',
    description: '实时分析文本字符、单词及字节',
    themeColorKey: 'secondary',
    icon: FileText,
    defaultVisible: true,
    component: TextStatisticsPage,
  },
  {
    key: 'jwt',
    label: 'JWT 解析',
    description: 'JSON Web Token 解码与查看',
    themeColorKey: 'info',
    icon: Key,
    defaultVisible: true,
    component: JwtPage,
  },
  {
    key: 'jsonTools',
    label: 'JSON 工具',
    description: '差异比较、格式化、YAML/TOML 转换及压缩',
    themeColorKey: 'primary',
    icon: GitCompareArrows,
    defaultVisible: true,
    component: JsonToolsPage,
  },
  {
    key: 'base64Converter',
    label: 'Base64 转换器',
    description: '文本、文件与图像的 Base64 编码转换',
    themeColorKey: 'info',
    icon: ArrowLeftRight,
    defaultVisible: true,
    component: Base64ConverterPage,
  },
  {
    key: 'rightClickRestorer',
    label: '右键恢复',
    description: '检测并恢复被网站禁用的浏览器右键菜单',
    themeColorKey: 'success',
    icon: MousePointerClick,
    defaultVisible: true,
    component: RightClickRestorerPage,
  },
  {
    key: 'testDataGenerator',
    label: '测试数据生成器',
    description: '自定义规则批量生成测试数据',
    themeColorKey: 'warning',
    icon: FileSpreadsheet,
    defaultVisible: true,
    component: TestDataGeneratorPage,
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
