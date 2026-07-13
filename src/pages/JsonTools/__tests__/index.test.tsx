import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Index from '../index';

const setWide = (wide: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: wide,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

describe('JsonTools 页面', () => {
  beforeEach(() => {
    // 默认窄屏（matches:false）
    setWide(false);
  });

  it('应该渲染模式切换按钮', () => {
    render(<Index />);
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('窄屏渲染 A/B 数据面板与 Compare 按钮', () => {
    setWide(false);
    render(<Index />);
    expect(screen.getByText('数据 A（原始）')).toBeInTheDocument();
    expect(screen.getByText('数据 B（目标）')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Compare A & B/i })).toBeInTheDocument();
  });

  it('宽屏渲染原始/目标 JSON 标签', () => {
    setWide(true);
    render(<Index />);
    expect(screen.getByText('原始 JSON')).toBeInTheDocument();
    expect(screen.getByText('目标 JSON')).toBeInTheDocument();
  });
});
