import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import PageSkeleton from '@/components/PageSkeleton';

describe('PageSkeleton 组件', () => {
  describe('渲染测试', () => {
    it('应渲染工具页面骨架', () => {
      const { container } = render(<PageSkeleton />);

      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('布局结构测试', () => {
    it('工具骨架屏应有内边距', () => {
      const { container } = render(<PageSkeleton />);
      const toolContainer = container.firstChild as HTMLElement;

      expect(toolContainer).toHaveClass('p-5');
    });
  });

  describe('骨架屏元素测试', () => {
    it('工具骨架屏应包含动画脉冲效果', () => {
      const { container } = render(<PageSkeleton />);

      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });
});
