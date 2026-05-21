import { ReactNode, useMemo } from 'react';
import { getEntryPointType } from '@/config/features';

/**
 * PageHeader 组件属性接口
 */
export interface PageHeaderProps {
  /** 要显示的图标组件 */
  icon: ReactNode;
  /** 图标的颜色，默认使用主题 primary.main 色 */
  iconColor?: string;
  /** 主标题文本 */
  title: string;
  /** 副标题文本（可选） */
  subtitle?: string;
  /** 在标题右侧显示的徽章/标签组件（可选） */
  badge?: ReactNode;
  /** 图标容器的自定义样式 */
  iconSx?: React.CSSProperties;
  /** 标题文本的自定义样式 */
  titleSx?: React.CSSProperties;
  /** 副标题文本的自定义样式 */
  subtitleSx?: React.CSSProperties;
  /** 整个组件的自定义样式 */
  sx?: React.CSSProperties;
}

/**
 * PageHeader - 通用页面标题栏组件
 *
 * 用于显示带图标的页面标题，支持自定义颜色、副标题、徽章等功能
 *
 * @example
 * ```tsx
 * <PageHeader
 *   icon={<AccessTimeIcon />}
 *   iconColor="#1976d2"
 *   title="时间戳转换"
 *   subtitle="Unix 毫秒数转换与格式化"
 * />
 * ```
 *
 * @example
 * ```tsx
 * <PageHeader
 *   icon={<StorageIcon />}
 *   iconColor={storageCleanerPageStyles.warningColor}
 *   title="存储清理"
 *   subtitle={domain}
 *   badge={<Badge>已占用 {size}</Badge>}
 * />
 * ```
 */
export default function PageHeader({
  icon,
  iconColor = '#3b82f6',
  title,
  subtitle,
  badge,
  iconSx,
  titleSx,
  subtitleSx,
  sx,
}: PageHeaderProps) {
  const entryPointType = useMemo(() => getEntryPointType(), []);

  if (entryPointType === 'popup') {
    return null;
  }

  return (
    <div className="flex items-center gap-3 mb-6" style={sx}>
      {/* 图标容器 */}
      <div
        className="p-2 rounded-lg flex items-center"
        style={{
          backgroundColor: `${iconColor}15`,
          color: iconColor,
          ...iconSx,
        }}
      >
        {icon}
      </div>
      {/* 标题区域 */}
      <div className="flex-1">
        {/* 标题行（含徽章） */}
        <div className="flex justify-between items-center">
          <span className="text-base font-extrabold tracking-tight leading-tight" style={titleSx}>
            {title}
          </span>
          {badge}
        </div>
        {/* 副标题 */}
        {subtitle && (
          <span className="text-xs font-semibold text-gray-500" style={subtitleSx}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
