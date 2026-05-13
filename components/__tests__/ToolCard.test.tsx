import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ToolCard from '@/pages/Dashboard/ToolCard';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

describe('ToolCard 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染测试', () => {
    it('应渲染标题和描述', () => {
      render(
        <ToolCard
          title="测试工具"
          description="这是一个测试工具"
          colorKey="primary"
          icon={<AccessTimeIcon />}
          onClick={() => {}}
        />,
      );

      expect(screen.getByText('测试工具')).toBeInTheDocument();
      expect(screen.getByText('这是一个测试工具')).toBeInTheDocument();
    });

    it('无描述时仅渲染标题', () => {
      render(
        <ToolCard title="仅标题" colorKey="primary" icon={<AccessTimeIcon />} onClick={() => {}} />,
      );

      expect(screen.getByText('仅标题')).toBeInTheDocument();
    });

    it('应渲染图标', () => {
      render(
        <ToolCard
          title="带图标"
          colorKey="primary"
          icon={<AccessTimeIcon data-testid="test-icon" />}
          onClick={() => {}}
        />,
      );

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('提供快照内容时应渲染快照', () => {
      render(
        <ToolCard
          title="带快照"
          colorKey="primary"
          icon={<AccessTimeIcon />}
          onClick={() => {}}
          snapshot={<div data-testid="snapshot">快照内容</div>}
        />,
      );

      expect(screen.getByTestId('snapshot')).toBeInTheDocument();
    });

    it('未提供快照时不渲染快照区域', () => {
      const { container } = render(
        <ToolCard title="无快照" colorKey="primary" icon={<AccessTimeIcon />} onClick={() => {}} />,
      );

      expect(container.querySelector('[data-testid="snapshot"]')).not.toBeInTheDocument();
    });

    it('应使用 CardActionArea 渲染，支持键盘聚焦', () => {
      render(
        <ToolCard title="可聚焦" colorKey="primary" icon={<AccessTimeIcon />} onClick={() => {}} />,
      );

      const button = screen.getByRole('button', { name: /可聚焦/ });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('交互测试', () => {
    it('点击时应调用 onClick', () => {
      const handleClick = vi.fn();
      render(
        <ToolCard
          title="可点击"
          colorKey="primary"
          icon={<AccessTimeIcon />}
          onClick={handleClick}
        />,
      );

      const button = screen.getByRole('button', { name: /可点击/ });
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('按 Enter 键时应调用 onClick', () => {
      const handleClick = vi.fn();
      render(
        <ToolCard
          title="键盘可触发"
          colorKey="primary"
          icon={<AccessTimeIcon />}
          onClick={handleClick}
        />,
      );

      const button = screen.getByRole('button', { name: /键盘可触发/ });
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyUp(button, { key: 'Enter' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('样式测试', () => {
    it('应应用自定义颜色代码', () => {
      render(
        <ToolCard
          title="自定义颜色"
          colorKey="warning"
          icon={<AccessTimeIcon data-testid="custom-color-icon" />}
          onClick={() => {}}
        />,
      );

      expect(screen.getByTestId('custom-color-icon')).toBeInTheDocument();
    });
  });
});
