import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloseIcon from '@mui/icons-material/Close';
import { render, screen } from '@testing-library/react';
import PageHeader, { type PageHeaderProps } from '@/components/PageHeader';

describe('PageHeader 组件系统', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });

  const defaultProps: PageHeaderProps = {
    icon: <AccessTimeIcon />,
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
      expect(screen.getByTestId('AccessTimeIcon')).toBeInTheDocument();
    });

    it('应渲染自定义图标&图标颜色', () => {
      render(<PageHeader {...defaultProps} icon={<CloseIcon />} iconColor="#FF0000" />);
      expect(screen.getByTestId('CloseIcon')).toBeInTheDocument();
      expect(screen.getByTestId('CloseIcon')).toHaveStyle('color: #FF0000;');
    });

    it('应渲染 badge 组件', () => {
      const badge = <span data-testid="test-badge">New</span>;
      render(<PageHeader {...defaultProps} badge={badge} />);
      expect(screen.getByTestId('test-badge')).toBeInTheDocument();
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('应渲染 badge 与 title 并排布局', () => {
      const badge = <span data-testid="side-badge">v1.0</span>;
      render(<PageHeader {...defaultProps} badge={badge} />);
      const title = screen.getByText('时间戳转换');
      const badgeEl = screen.getByTestId('side-badge');
      expect(title).toBeInTheDocument();
      expect(badgeEl).toBeInTheDocument();
    });
  });

  describe('PageHeader 条件渲染', () => {
    it('subtitle 为 undefined 时不应渲染副标题', () => {
      const { container } = render(<PageHeader icon={<AccessTimeIcon />} title="仅标题" />);
      const captionElements = container.querySelectorAll('p');
      expect(captionElements.length).toBe(0);
    });

    it('subtitle 为空字符串时不应渲染副标题', () => {
      const { container } = render(
        <PageHeader icon={<AccessTimeIcon />} title="标题" subtitle="" />,
      );
      const captionElements = container.querySelectorAll('p');
      expect(captionElements.length).toBe(0);
    });

    it('badge 为 undefined 时不应渲染 badge 区域', () => {
      render(<PageHeader {...defaultProps} />);
      expect(screen.queryByText('v1.0')).not.toBeInTheDocument();
    });
  });

  describe('PageHeader 样式扩展', () => {
    it('iconSx 应作为属性传递给图标容器', () => {
      const { container } = render(
        <PageHeader {...defaultProps} iconSx={{ border: '2px solid red' }} />,
      );
      const iconContainer = container.querySelector('div');
      expect(iconContainer).toBeTruthy();
    });

    it('titleSx 应作为属性传递给标题', () => {
      render(<PageHeader {...defaultProps} titleSx={{ fontWeight: 'bold' }} />);
      const titleEl = screen.getByText('时间戳转换');
      expect(titleEl).toBeInTheDocument();
    });

    it('subtitleSx 应作为属性传递给副标题', () => {
      render(<PageHeader {...defaultProps} subtitleSx={{ color: 'red' }} />);
      const subtitleEl = screen.getByText('Unix 毫秒数转换与格式化');
      expect(subtitleEl).toBeInTheDocument();
    });

    it('sx 应作为属性传递给外层容器', () => {
      const { container } = render(<PageHeader {...defaultProps} sx={{ mt: 3 }} />);
      const outerElement = container.firstChild;
      expect(outerElement).toBeTruthy();
    });
  });
});
