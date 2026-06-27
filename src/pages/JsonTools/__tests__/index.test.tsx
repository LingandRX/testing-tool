import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Index from '../index';

describe('JsonTools 页面', () => {
  it('应该渲染模式切换按钮', () => {
    render(<Index />);
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });
});
