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
      const iconContainer = screen.getByTestId('test-icon').parentElement?.parentElement;
      expect(iconContainer).toHaveClass('text-blue-500');
    });

    it('应渲染 badge 组件', () => {
      const badge = <span data-testid="test-badge">New</span>;
      render(<PageHeader {...defaultProps} badge={badge} />);
      expect(screen.getByTestId('test-badge')).toBeInTheDocument();
    });

    it('应支持自定义 iconClassName', () => {
      render(<PageHeader {...defaultProps} iconClassName="custom-icon-class" />);
      const iconContainer = screen.getByTestId('test-icon').parentElement?.parentElement;
      expect(iconContainer).toHaveClass('custom-icon-class');
    });

    it('应支持自定义 titleClassName', () => {
      render(<PageHeader {...defaultProps} titleClassName="custom-title-class" />);
      const title = screen.getByText('时间戳转换');
      expect(title).toHaveClass('custom-title-class');
    });

    it('应支持自定义 subtitleClassName', () => {
      render(<PageHeader {...defaultProps} subtitleClassName="custom-subtitle-class" />);
      const subtitle = screen.getByText('Unix 毫秒数转换与格式化');
      expect(subtitle).toHaveClass('custom-subtitle-class');
    });

    it('应支持自定义 className', () => {
      const { container } = render(<PageHeader {...defaultProps} className="custom-page-header" />);
      const outerElement = container.firstChild;
      expect(outerElement).toHaveClass('custom-page-header');
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
