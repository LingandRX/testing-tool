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
    labelKey: 'dashboard_title',
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
    labelKey: 'timestamp_title',
    descriptionKey: 'timestamp_description',
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
    labelKey: 'storageCleaner_title',
    descriptionKey: 'storageCleaner_description',
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
    labelKey: 'qrCode_title',
    descriptionKey: 'qrCode_description',
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
    labelKey: 'textStatistics_title',
    descriptionKey: 'textStatistics_description',
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
    labelKey: 'jwt_title',
    descriptionKey: 'jwt_description',
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
    labelKey: 'jsonDiff_title',
    descriptionKey: 'jsonDiff_description',
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
    labelKey: 'base64Converter_title',
    descriptionKey: 'base64Converter_description',
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
    labelKey: 'markdownToHtml_title',
    descriptionKey: 'markdownToHtml_description',
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
    labelKey: 'htmlToMarkdown_title',
    descriptionKey: 'htmlToMarkdown_description',
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
    labelKey: 'rightClickRestorer_title',
    descriptionKey: 'rightClickRestorer_description',
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
