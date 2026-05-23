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
  Code,
  File,
  MousePointerClick,
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
const MarkdownToHtmlPage = lazy(() => import('@/pages/MarkdownToHtml'));
const HtmlToMarkdownPage = lazy(() => import('@/pages/HtmlToMarkdown'));
const RightClickRestorerPage = lazy(() => import('@/pages/RightClickRestorer'));

export interface FeatureConfig {
  key: PageType;
  labelKey: string;
  descriptionKey: string;
  themeColorKey?: PaletteColorKey;
  icon?: ComponentType<LucideProps>;
  defaultVisible: boolean;
  components: {
    popup: ComponentType;
    sidepanel: ComponentType;
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
    themeColorKey: 'primary',
    icon: Clock,
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
    themeColorKey: 'warning',
    icon: Database,
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
    themeColorKey: 'success',
    icon: QrCode,
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
    themeColorKey: 'secondary',
    icon: FileText,
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
    themeColorKey: 'info',
    icon: Key,
    defaultVisible: true,
    components: {
      popup: JwtPage,
      sidepanel: JwtPage,
      tab: JwtPage,
    },
  },
  {
    key: 'jsonDiff',
    labelKey: 'features:jsonDiff.title',
    descriptionKey: 'features:jsonDiff.description',
    themeColorKey: 'primary',
    icon: GitCompareArrows,
    defaultVisible: true,
    components: {
      popup: JsonToolsPage,
      sidepanel: JsonToolsPage,
      tab: JsonToolsPage,
    },
  },
  {
    key: 'base64Converter',
    labelKey: 'features:base64Converter.title',
    descriptionKey: 'features:base64Converter.description',
    themeColorKey: 'info',
    icon: ArrowLeftRight,
    defaultVisible: true,
    components: {
      popup: Base64ConverterPage,
      sidepanel: Base64ConverterPage,
      tab: Base64ConverterPage,
    },
  },
  {
    key: 'markdownToHtml',
    labelKey: 'features:markdownToHtml.title',
    descriptionKey: 'features:markdownToHtml.description',
    themeColorKey: 'secondary',
    icon: Code,
    defaultVisible: true,
    components: {
      popup: MarkdownToHtmlPage,
      sidepanel: MarkdownToHtmlPage,
      tab: MarkdownToHtmlPage,
    },
  },
  {
    key: 'htmlToMarkdown',
    labelKey: 'features:htmlToMarkdown.title',
    descriptionKey: 'features:htmlToMarkdown.description',
    themeColorKey: 'secondary',
    icon: File,
    defaultVisible: true,
    components: {
      popup: HtmlToMarkdownPage,
      sidepanel: HtmlToMarkdownPage,
      tab: HtmlToMarkdownPage,
    },
  },
  {
    key: 'rightClickRestorer',
    labelKey: 'features:rightClickRestorer.title',
    descriptionKey: 'features:rightClickRestorer.description',
    themeColorKey: 'success',
    icon: MousePointerClick,
    defaultVisible: true,
    components: {
      popup: RightClickRestorerPage,
      sidepanel: RightClickRestorerPage,
      tab: RightClickRestorerPage,
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
