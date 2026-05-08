/**
 * ToolCard 组件 - 工具卡片
 *
 * 用于在仪表盘中展示各个工具功能的卡片组件，支持图标、标题、描述、
 * 快照内容展示，具备悬停动画效果。
 */
import { alpha, Box, Card, CardActionArea, Stack, Typography, useTheme } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import React from 'react';
import type { PaletteColorKey } from '@/config/features';

/**
 * ToolCard 组件属性接口
 */
interface ToolCardProps {
  /** 工具卡片标题 */
  title: string;
  /** 工具卡片描述文本（可选） */
  description?: string;
  /** 快照内容，用于在卡片底部展示额外信息（可选） */
  snapshot?: React.ReactNode;
  /** 主题色键，映射到 theme.palette[key].main */
  colorKey: PaletteColorKey;
  /** 工具图标元素 */
  icon: React.ReactNode;
  /** 卡片点击事件处理函数 */
  onClick: () => void;
}

/**
 * ToolCard 组件
 *
 * @param props - ToolCardProps 属性对象
 * @returns 工具卡片 JSX 元素
 */
export default function ToolCard({
  title,
  description,
  snapshot,
  colorKey,
  icon,
  onClick,
}: ToolCardProps) {
  const theme = useTheme();
  const colorCode = theme.palette[colorKey].main;

  return (
    <Card
      elevation={0}
      sx={{
        position: 'relative',
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        boxSizing: 'border-box',
        transition:
          'border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: colorCode,
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px -10px ${alpha(colorCode, 0.2)}`,
        },
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          p: 2.5,
          gap: 1.5,
          '&:hover .arrow-icon': {
            transform: 'translateX(4px)',
            color: colorCode,
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" width="100%">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 3,
                bgcolor: alpha(colorCode, 0.07),
                color: colorCode,
              }}
            >
              {icon}
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: 'text.primary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {title}
              </Typography>
              {description && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                    display: 'block',
                    mt: 0.5,
                  }}
                >
                  {description}
                </Typography>
              )}
            </Box>
          </Stack>
          <ArrowForwardIosIcon
            className="arrow-icon"
            sx={{
              fontSize: 12,
              color: 'text.disabled',
              mt: 0.5,
              transition: 'all 0.3s ease',
            }}
          />
        </Stack>

        {snapshot != null && (
          <Box
            sx={{
              mt: 'auto',
              pt: 1.5,
              borderTop: '1px dashed',
              borderColor: 'divider',
              width: '100%',
            }}
          >
            {snapshot}
          </Box>
        )}
      </CardActionArea>
    </Card>
  );
}

ToolCard.displayName = 'ToolCard';
