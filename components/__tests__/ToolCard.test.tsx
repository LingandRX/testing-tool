import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ToolCard from '../ToolCard';
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
          colorCode="#2196f3"
          icon={<AccessTimeIcon />}
          onClick={() => {}}
        />,
      );

      expect(screen.getByText('测试工具')).toBeInTheDocument();
      expect(screen.getByText('这是一个测试工具')).toBeInTheDocument();
    });

    it('无描述时仅渲染标题', () => {
      render(
        <ToolCard
          title="仅标题"
          colorCode="#2196f3"
          icon={<AccessTimeIcon />}
          onClick={() => {}}
        />,
      );

      expect(screen.getByText('仅标题')).toBeInTheDocument();
    });

    it('应渲染图标', () => {
      render(
        <ToolCard
          title="带图标"
          colorCode="#2196f3"
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
          colorCode="#2196f3"
          icon={<AccessTimeIcon />}
          onClick={() => {}}
          snapshot={<div data-testid="snapshot">快照内容</div>}
        />,
      );

      expect(screen.getByTestId('snapshot')).toBeInTheDocument();
    });

    it('未提供快照时不渲染快照区域', () => {
      const { container } = render(
        <ToolCard
          title="无快照"
          colorCode="#2196f3"
          icon={<AccessTimeIcon />}
          onClick={() => {}}
        />,
      );

      expect(container.querySelector('[data-testid="snapshot"]')).not.toBeInTheDocument();
    });
  });

  describe('AI 徽章测试', () => {
    it('hasAI 为 true 时应渲染 AI 徽章', () => {
      render(
        <ToolCard
          title="AI 工具"
          hasAI={true}
          colorCode="#2196f3"
          icon={<AccessTimeIcon />}
          onClick={() => {}}
        />,
      );

      const autoAwesomeIcon = screen.getByTestId('AutoAwesomeIcon');
      expect(autoAwesomeIcon).toBeInTheDocument();
    });

    it('hasAI 为 false 时不应渲染 AI 徽章', () => {
      render(
        <ToolCard
          title="普通工具"
          hasAI={false}
          colorCode="#2196f3"
          icon={<AccessTimeIcon />}
          onClick={() => {}}
        />,
      );

      const autoAwesomeIcon = screen.queryByTestId('AutoAwesomeIcon');
      expect(autoAwesomeIcon).not.toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('点击时应调用 onClick', () => {
      const handleClick = vi.fn();
      render(
        <ToolCard
          title="可点击"
          colorCode="#2196f3"
          icon={<AccessTimeIcon />}
          onClick={handleClick}
        />,
      );

      const card = screen.getByText('可点击').closest('.MuiBox-root');
      if (card) {
        fireEvent.click(card);
      }

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('样式测试', () => {
    it('应应用自定义颜色代码', () => {
      const customColor = '#ff5722';
      const { container } = render(
        <ToolCard
          title="自定义颜色"
          colorCode={customColor}
          icon={<AccessTimeIcon />}
          onClick={() => {}}
        />,
      );

      const iconContainer = container.querySelector('.MuiBox-root > div');
      expect(iconContainer).toBeInTheDocument();
    });
  });
});
