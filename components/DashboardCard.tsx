import React from 'react';
import ToolCard from './ToolCard';
import type { ToolCardConfig } from '@/config/dashboardCards';

interface DashboardCardProps {
  /** 卡片配置数据 */
  config: ToolCardConfig;
  /** 点击卡片时的回调函数 */
  onClick: () => void;
  /** 卡片右侧的实时预览内容（如时间戳显示） */
  snapshot?: React.ReactNode;
  /** 卡片背景色，默认使用主题色 */
  cardBackgroundColor?: string;
}

/**
 * DashboardCard - 仪表盘卡片组件
 *
 * 基于 ToolCard 的封装，专门用于仪表盘页面
 * 使用 React.memo 避免不必要的重渲染
 */
const DashboardCard = React.memo(
  ({ config, onClick, snapshot, cardBackgroundColor }: DashboardCardProps) => (
    <ToolCard
      title={config.title}
      description={config.description}
      colorCode={config.colorCode}
      icon={config.icon}
      onClick={onClick}
      cardBackgroundColor={cardBackgroundColor}
      snapshot={snapshot}
    />
  ),
);

export default DashboardCard;
