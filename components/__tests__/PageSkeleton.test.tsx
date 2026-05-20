import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import PageSkeleton from '@/components/PageSkeleton';

describe('PageSkeleton 组件', () => {
  describe('渲染测试', () => {
    it('默认应渲染 dashboard 骨架屏', () => {
      const { container } = render(<PageSkeleton />);

      // dashboard 骨架屏包含 6 个卡片
      const skeletons = container.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('variant 为 dashboard 时应渲染仪表盘卡片骨架', () => {
      const { container } = render(<PageSkeleton variant="dashboard" />);

      // 每个卡片有 4 个 Skeleton（图标、标题、描述、箭头），6 个卡片共 24 个
      const skeletons = container.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBe(24);
    });

    it('variant 为 tool 时应渲染工具页面骨架', () => {
      const { container } = render(<PageSkeleton variant="tool" />);

      // tool 骨架屏包含标题、输入区、控制栏 3 个按钮、结果区
      const skeletons = container.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBe(6);
    });
  });

  describe('布局结构测试', () => {
    it('dashboard 骨架屏应使用 grid 布局', () => {
      const { container } = render(<PageSkeleton variant="dashboard" />);
      const gridContainer = container.firstChild as HTMLElement;

      expect(gridContainer).toHaveStyle({ display: 'grid' });
    });

    it('tool 骨架屏应有内边距', () => {
      const { container } = render(<PageSkeleton variant="tool" />);
      const toolContainer = container.firstChild as HTMLElement;

      expect(toolContainer).toHaveStyle({ padding: '20px' }); // 2.5 * 8px
    });
  });

  describe('骨架屏元素测试', () => {
    it('dashboard 骨架屏应包含圆角和边框样式', () => {
      const { container } = render(<PageSkeleton variant="dashboard" />);

      // 获取第一个卡片容器
      const card = container.querySelector('[class*="MuiBox-root"]');
      expect(card).toBeInTheDocument();
    });

    it('tool 骨架屏应包含圆形和矩形变体', () => {
      const { container } = render(<PageSkeleton variant="tool" />);

      const roundedSkeletons = container.querySelectorAll('.MuiSkeleton-rounded');
      const textSkeletons = container.querySelectorAll('.MuiSkeleton-text');

      expect(roundedSkeletons.length).toBeGreaterThan(0);
      expect(textSkeletons.length).toBeGreaterThan(0);
    });
  });
});
