import { Stack, Typography, Box, alpha, SxProps, Theme } from '@mui/material';
import { ReactNode } from 'react';

/**
 * PageHeader 组件属性接口
 */
export interface PageHeaderProps {
  /** 要显示的图标组件 */
  icon: ReactNode;
  /** 图标的颜色，默认为 '#1976d2'（蓝色） */
  iconColor?: string;
  /** 主标题文本 */
  title: string;
  /** 副标题文本（可选） */
  subtitle?: string;
  /** 在标题右侧显示的徽章/标签组件（可选） */
  badge?: ReactNode;
  /** 图标容器的自定义样式 */
  iconSx?: SxProps<Theme>;
  /** 标题文本的自定义样式 */
  titleSx?: SxProps<Theme>;
  /** 副标题文本的自定义样式 */
  subtitleSx?: SxProps<Theme>;
  /** 整个组件的自定义样式 */
  sx?: SxProps<Theme>;
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
  iconColor = '#1976d2',
  title,
  subtitle,
  badge,
  iconSx,
  titleSx,
  subtitleSx,
  sx,
}: PageHeaderProps) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5, ...sx }}>
      {/* 图标容器 */}
      <Box
        sx={{
          p: 1,
          borderRadius: 2.5,
          bgcolor: alpha(iconColor, 0.1),
          color: iconColor,
          display: 'flex',
          ...iconSx,
        }}
      >
        {icon}
      </Box>
      {/* 标题区域 */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* 标题行（含徽章） */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={{ xs: 0.5, sm: 0 }}
        >
          <Typography
            variant="subtitle1"
            fontWeight={900}
            sx={{
              letterSpacing: '-0.5px',
              lineHeight: 1.2,
              wordBreak: 'break-word',
              ...titleSx,
            }}
          >
            {title}
          </Typography>
          {badge}
        </Stack>
        {/* 副标题 */}
        {subtitle && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600, ...subtitleSx }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
