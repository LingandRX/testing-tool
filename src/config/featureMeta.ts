import type { ComponentType } from 'react';
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

export const MIN_POPUP_HEIGHT = 400;
export const MAX_POPUP_HEIGHT = 600;
export const DEFAULT_POPUP_HEIGHT = 600;

export interface FeatureConfig {
  key: PageType;
  label: string;
  description: string;
  themeColorKey?: PaletteColorKey;
  icon?: ComponentType<LucideProps>;
  defaultVisible: boolean;
  popupHeight?: number;
}

export const FEATURES: FeatureConfig[] = [
  {
    key: 'timestamp',
    label: '时间戳',
    description: 'Unix 毫秒数转换与格式化',
    themeColorKey: 'primary',
    icon: Clock,
    defaultVisible: true,
    popupHeight: 480,
  },
  {
    key: 'storageCleaner',
    label: '存储清理',
    description: '清理缓存、Cookies 及本地存储',
    themeColorKey: 'warning',
    icon: Database,
    defaultVisible: true,
    popupHeight: 500,
  },
  {
    key: 'qrCode',
    label: '二维码工具',
    description: '生成当前选中的 URL 的二维码',
    themeColorKey: 'success',
    icon: QrCode,
    defaultVisible: true,
    popupHeight: 520,
  },
  {
    key: 'textStatistics',
    label: '文本统计',
    description: '实时分析文本字符、单词及字节',
    themeColorKey: 'secondary',
    icon: FileText,
    defaultVisible: true,
    popupHeight: 520,
  },
  {
    key: 'jwt',
    label: 'JWT 解析',
    description: 'JSON Web Token 解码与查看',
    themeColorKey: 'info',
    icon: Key,
    defaultVisible: true,
    popupHeight: 560,
  },
  {
    key: 'jsonTools',
    label: 'JSON 工具',
    description: '差异比较、格式化、YAML/TOML 转换及压缩',
    themeColorKey: 'primary',
    icon: GitCompareArrows,
    defaultVisible: true,
    popupHeight: 600,
  },
  {
    key: 'base64Converter',
    label: 'Base64 转换器',
    description: '文本、文件与图像的 Base64 编码转换',
    themeColorKey: 'info',
    icon: ArrowLeftRight,
    defaultVisible: true,
    popupHeight: 560,
  },
  {
    key: 'rightClickRestorer',
    label: '右键恢复',
    description: '检测并恢复被网站禁用的浏览器右键菜单',
    themeColorKey: 'success',
    icon: MousePointerClick,
    defaultVisible: true,
    popupHeight: 420,
  },
  {
    key: 'testDataGenerator',
    label: '测试数据生成器',
    description: '自定义规则批量生成测试数据',
    themeColorKey: 'warning',
    icon: FileSpreadsheet,
    defaultVisible: true,
    popupHeight: 600,
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
  return FEATURES.map((f) => f.key);
}

export function getPopupHeight(key: PageType): number {
  const feature = getFeatureByKey(key);
  const height = feature?.popupHeight ?? DEFAULT_POPUP_HEIGHT;
  return Math.min(Math.max(height, MIN_POPUP_HEIGHT), MAX_POPUP_HEIGHT);
}
