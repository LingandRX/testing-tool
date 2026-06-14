import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Index from '../index';

describe('Timestamp 页面', () => {
  it('应该渲染模式切换按钮', () => {
    render(<Index />);
    // 基本渲染测试：页面含多个模式切换按钮，应至少渲染一个
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });
});
