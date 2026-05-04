import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Button from '../Button';

describe('Button 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染测试', () => {
    it('应使用默认属性渲染', () => {
      render(<Button>点击我</Button>);
      const button = screen.getByRole('button', { name: /点击我/i });
      expect(button).toBeInTheDocument();
    });

    it('应渲染自定义文本', () => {
      render(<Button>提交</Button>);
      expect(screen.getByRole('button', { name: /提交/i })).toBeInTheDocument();
    });

    it('应渲染不同变体', () => {
      const { rerender } = render(<Button variant="contained">填充</Button>);
      expect(screen.getByRole('button', { name: /填充/i })).toBeInTheDocument();

      rerender(<Button variant="outlined">描边</Button>);
      expect(screen.getByRole('button', { name: /描边/i })).toBeInTheDocument();

      rerender(<Button variant="text">文本</Button>);
      expect(screen.getByRole('button', { name: /文本/i })).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('点击时应调用 onClick', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>点击我</Button>);

      fireEvent.click(screen.getByRole('button', { name: /点击我/i }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('禁用状态下点击不应调用 onClick', () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          禁用按钮
        </Button>,
      );

      fireEvent.click(screen.getByRole('button', { name: /禁用按钮/i }));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('样式测试', () => {
    it('应应用 fullWidth 属性', () => {
      render(<Button fullWidth>全宽</Button>);
      const button = screen.getByRole('button', { name: /全宽/i });
      expect(button).toHaveClass('MuiButton-fullWidth');
    });
  });

  describe('状态测试', () => {
    it('应渲染加载状态', () => {
      render(<Button loading>加载中</Button>);
      const button = screen.getByRole('button', { name: /加载中/i });
      expect(button).toHaveClass('MuiButton-loading');
    });

    it('应渲染为禁用状态', () => {
      render(<Button disabled>禁用</Button>);
      const button = screen.getByRole('button', { name: /禁用/i });
      expect(button).toBeDisabled();
    });
  });
});
