import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Index from '../index';

describe('Timestamp 页面', () => {
  it('应该渲染页面标题', () => {
    render(<Index />);
    // 基本渲染测试
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
