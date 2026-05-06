/**
 * ToolCard 组件 - 工具卡片
 *
 * 用于在仪表盘中展示各个工具功能的卡片组件，支持图标、标题、描述、
 * AI 标识和快照内容展示，具备悬停动画效果。
 */
import { Box, Stack, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'; // Sparkles for AI
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import React from 'react';

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
  /** 主题色代码，用于图标背景和悬停效果 */
  colorCode: string;
  /** 工具图标元素 */
  icon: React.ReactNode;
  /** 卡片点击事件处理函数 */
  onClick: () => void;
  /** 是否显示 AI 标识（可选） */
  hasAI?: boolean;
  /** 卡片背景色，默认为 'background.paper' */
  cardBackgroundColor?: string;
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
  colorCode,
  icon,
  onClick,
  hasAI,
  cardBackgroundColor = 'background.paper',
}: ToolCardProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        position: 'relative',
        bgcolor: cardBackgroundColor,
        borderRadius: 4,
        p: 2.5,
        cursor: 'pointer',
        border: '1px solid',
        borderColor: 'grey.100',
        height: '100%',
        boxSizing: 'border-box',
        // 使用 cubic-bezier 缓动函数实现平滑的过渡动画
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        // 悬停效果：边框变色、向上位移、添加阴影
        '&:hover': {
          borderColor: colorCode,
          transform: 'translateY(-4px)',
          // 阴影颜色为主题色的 20% 透明度（十六进制后两位 33 约等于 20%）
          boxShadow: `0 12px 24px -10px ${colorCode}33`,
          // 悬停时箭头图标右移并变色
          '& .arrow-icon': {
            transform: 'translateX(4px)',
            color: colorCode,
          },
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 3,
              // 图标背景色为主题色的 7% 透明度（十六进制后两位 11 约等于 7%）
              bgcolor: `${colorCode}11`,
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
              {hasAI && <AutoAwesomeIcon sx={{ fontSize: 14, color: '#f5b041' }} />}
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
            color: 'grey.300',
            mt: 0.5,
            transition: 'all 0.3s ease',
          }}
        />
      </Stack>

      {snapshot && (
        <Box
          sx={{
            mt: 'auto',
            pt: 1.5,
            borderTop: '1px dashed',
            borderColor: 'grey.100',
          }}
        >
          {snapshot}
        </Box>
      )}
    </Box>
  );
}
