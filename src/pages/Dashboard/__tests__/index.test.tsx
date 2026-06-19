import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFeatureByKey } from '@/config/features';
import type { DashboardFeatureItem } from '../useDashboard';
import Index from '../index';

const mockNavigateTo = vi.fn();
const mockUseDashboard = vi.fn();

vi.mock('../useDashboard', () => ({
  useDashboard: () => mockUseDashboard(),
}));

function buildFeatureItem(key: 'timestamp' | 'jwt'): DashboardFeatureItem {
  const feature = getFeatureByKey(key)!;
  return {
    key,
    feature: feature as DashboardFeatureItem['feature'],
  };
}

describe('Dashboard 页面', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDashboard.mockReturnValue({
      visibleFeatures: [buildFeatureItem('timestamp'), buildFeatureItem('jwt')],
      recentFeatures: [],
      showRecent: false,
      navigateTo: mockNavigateTo,
    });
  });

  it('应渲染全部工具网格', () => {
    render(<Index />);

    expect(screen.getByText('全部工具')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '时间戳' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'JWT 解析' })).toBeInTheDocument();
  });

  it('点击工具卡片应触发 navigateTo', async () => {
    const user = userEvent.setup();
    render(<Index />);

    await user.click(screen.getByRole('button', { name: '时间戳' }));

    expect(mockNavigateTo).toHaveBeenCalledTimes(1);
    expect(mockNavigateTo).toHaveBeenCalledWith('timestamp');
  });

  it('有最近使用数据时应显示最近使用区块', () => {
    mockUseDashboard.mockReturnValue({
      visibleFeatures: [buildFeatureItem('timestamp')],
      recentFeatures: [buildFeatureItem('jwt')],
      showRecent: true,
      navigateTo: mockNavigateTo,
    });

    render(<Index />);

    expect(screen.getByText('最近使用')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'JWT 解析' })).toBeInTheDocument();
  });

  it('无最近使用数据时不应显示最近使用区块', () => {
    render(<Index />);

    expect(screen.queryByText('最近使用')).not.toBeInTheDocument();
  });

  it('点击最近使用按钮应触发 navigateTo', async () => {
    const user = userEvent.setup();
    mockUseDashboard.mockReturnValue({
      visibleFeatures: [buildFeatureItem('timestamp')],
      recentFeatures: [buildFeatureItem('jwt')],
      showRecent: true,
      navigateTo: mockNavigateTo,
    });

    render(<Index />);

    await user.click(screen.getByRole('button', { name: 'JWT 解析' }));

    expect(mockNavigateTo).toHaveBeenCalledWith('jwt');
  });

  it('无可见工具时应显示空状态', () => {
    mockUseDashboard.mockReturnValue({
      visibleFeatures: [],
      recentFeatures: [],
      showRecent: false,
      navigateTo: mockNavigateTo,
    });

    render(<Index />);

    expect(screen.getByText('没有可用的工具')).toBeInTheDocument();
  });
});
