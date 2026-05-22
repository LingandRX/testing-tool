import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PageHeader, { type PageHeaderProps } from '@/components/PageHeader';

vi.mock('@/config/features', () => ({
  getEntryPointType: vi.fn(() => 'sidepanel'),
}));

describe('PageHeader 组件系统', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });

  const defaultProps: PageHeaderProps = {
    icon: <span data-testid="test-icon">⏰</span>,
    title: '时间戳转换',
    subtitle: 'Unix 毫秒数转换与格式化',
  };

  describe('PageHeader UI 渲染', () => {
    it('应渲染页面标题栏&副标题', () => {
      render(<PageHeader {...defaultProps} />);
      expect(screen.getByText('时间戳转换')).toBeInTheDocument();
      expect(screen.getByText('Unix 毫秒数转换与格式化')).toBeInTheDocument();
    });

    it('应渲染图标', () => {
      render(<PageHeader {...defaultProps} />);
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('应渲染自定义图标&图标颜色', () => {
      render(
        <PageHeader
          {...defaultProps}
          icon={<span data-testid="custom-icon">X</span>}
          iconColor="#FF0000"
        />,
      );
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('应默认使用蓝色作为 primary 色', () => {
      render(<PageHeader {...defaultProps} />);
      const iconContainer = screen.getByTestId('test-icon').parentElement;
      expect(iconContainer).toHaveStyle('background-color: #3b82f615');
      expect(iconContainer).toHaveStyle('color: #3b82f6');
    });

    it('应渲染 badge 组件', () => {
      const badge = <span data-testid="test-badge">New</span>;
      render(<PageHeader {...defaultProps} badge={badge} />);
      expect(screen.getByTestId('test-badge')).toBeInTheDocument();
    });

    it('应支持自定义 iconSx', () => {
      render(<PageHeader {...defaultProps} iconSx={{ borderRadius: '8px' }} />);
      const iconContainer = screen.getByTestId('test-icon').parentElement;
      expect(iconContainer).toHaveStyle('border-radius: 8px');
    });

    it('应支持自定义 titleSx', () => {
      render(<PageHeader {...defaultProps} titleSx={{ fontSize: '1.2rem' }} />);
      const title = screen.getByText('时间戳转换');
      expect(title).toHaveStyle('font-size: 1.2rem');
    });

    it('应支持自定义 subtitleSx', () => {
      render(<PageHeader {...defaultProps} subtitleSx={{ color: 'red' }} />);
      const subtitle = screen.getByText('Unix 毫秒数转换与格式化');
      expect(subtitle).toHaveStyle('color: rgb(255, 0, 0)');
    });

    it('应支持自定义 sx', () => {
      const { container } = render(<PageHeader {...defaultProps} sx={{ marginBottom: '2rem' }} />);
      const outerElement = container.firstChild;
      expect(outerElement).toHaveStyle('margin-bottom: 2rem');
    });

    it('无副标题时不渲染副标题区域', () => {
      const { container } = render(<PageHeader icon={defaultProps.icon} title="仅标题" />);
      const subtitles = container.querySelectorAll('.text-muted-foreground');
      expect(subtitles.length).toBe(0);
    });
  });

  describe('PageHeader 入口点隐藏', () => {
    it('popup 模式下应返回 null', async () => {
      const { getEntryPointType } = await import('@/config/features');
      vi.mocked(getEntryPointType).mockReturnValue('popup');

      const { container } = render(<PageHeader {...defaultProps} />);
      expect(container.innerHTML).toBe('');
    });
  });
});
