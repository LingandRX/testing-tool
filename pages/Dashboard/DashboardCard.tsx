import React from 'react';
import ToolCard from './ToolCard';
import { PageType } from '@/types/storage';

interface DashboardCardProps {
  /** 卡片标题 */
  title: string;
  /** 卡片描述文字 */
  description: string;
  /** 主题颜色代码 */
  colorCode: string;
  /** 图标组件 */
  icon: React.ReactNode;
  /** 页面键 */
  pageKey: PageType;
  /** 点击卡片时的回调函数 */
  onClick: (page: PageType) => void;
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
const DashboardCard = React.memo(({ onClick, pageKey, ...props }: DashboardCardProps) => {
  const handleClick = useCallback(() => {
    onClick(pageKey);
  }, [onClick, pageKey]);

  return <ToolCard {...props} onClick={handleClick} />;
});

DashboardCard.displayName = 'DashboardCard';

export default DashboardCard;
