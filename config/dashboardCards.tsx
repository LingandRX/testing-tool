import type { ReactNode } from 'react';
import type { PageType } from '@/types/storage';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StorageIcon from '@mui/icons-material/Storage';
import LanguageIcon from '@mui/icons-material/Language';
import QrCodeIcon from '@mui/icons-material/QrCode';
import DescriptionIcon from '@mui/icons-material/Description';

/**
 * 仪表盘卡片配置
 *
 * 定义仪表盘页面上各工具卡片的静态配置数据
 */
export type ToolCardConfig = {
  /** 卡片标题 */
  title: string;
  /** 卡片描述文字 */
  description: string;
  /** 主题颜色代码 */
  colorCode: string;
  /** 图标组件 */
  icon: ReactNode;
};

export const cardConfigs: Record<PageType, ToolCardConfig> = {
  timestamp: {
    title: '时间戳',
    description: 'Unix 毫秒数转换与格式化',
    colorCode: '#2196f3',
    icon: <AccessTimeIcon sx={{ fontSize: 20 }} />,
  },
  storageCleaner: {
    title: '存储管理',
    description: '清理缓存、Cookies 及本地存储',
    colorCode: '#ff9800',
    icon: <StorageIcon sx={{ fontSize: 20 }} />,
  },
  openUrl: {
    title: '打开 URL',
    description: '打开当前选中的 URL',
    colorCode: '#2196f3',
    icon: <LanguageIcon sx={{ fontSize: 20 }} />,
  },
  qrCode: {
    title: '生成二维码',
    description: '生成当前选中的 URL 的二维码',
    colorCode: '#2196f3',
    icon: <QrCodeIcon sx={{ fontSize: 20 }} />,
  },
  formMapping: {
    title: '通用表单映射助手',
    description: '智能识别表单指纹，自定义填充逻辑',
    colorCode: '#3f51b5',
    icon: <DescriptionIcon sx={{ fontSize: 20 }} />,
  },
  formRecognizer: {
    title: '表单指纹助手',
    description: '智能识别表单指纹',
    colorCode: '#3f51b5',
    icon: <DescriptionIcon sx={{ fontSize: 20 }} />,
  },
  formFill: {
    title: '表单填充助手',
    description: '根据表单指纹填充表单数据',
    colorCode: '#3f51b5',
    icon: <DescriptionIcon sx={{ fontSize: 20 }} />,
  },
  dashboard: {
    title: '',
    description: '',
    colorCode: '',
    icon: undefined,
  },
  openUrlViewer: {
    title: '',
    description: '',
    colorCode: '',
    icon: undefined,
  },
};
