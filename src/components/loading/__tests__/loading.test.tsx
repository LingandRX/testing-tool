import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingPlaceholder from '../LoadingPlaceholder';
import PageSkeleton from '../PageSkeleton';
import { Spinner } from '../Spinner';

describe('Spinner', () => {
  it('默认渲染 sm 尺寸并对屏幕阅读器隐藏', () => {
    render(<Spinner data-testid="spinner" />);
    const el = screen.getByTestId('spinner');
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el.querySelector('.animate-spin')).toBeInTheDocument();
    expect(el.querySelector('.h-4')).not.toBeNull();
  });

  it('支持尺寸变体', () => {
    render(<Spinner size="lg" data-testid="spinner-lg" />);
    expect(screen.getByTestId('spinner-lg').querySelector('.h-9')).not.toBeNull();

    render(<Spinner size="xs" data-testid="spinner-xs" />);
    expect(screen.getByTestId('spinner-xs').querySelector('.h-3\\.5')).not.toBeNull();
  });

  it('应用 motion-reduce 降级类', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('.motion-reduce\\:animate-none')).not.toBeNull();
  });
});

describe('LoadingPlaceholder', () => {
  it('渲染默认文案与加载语义', () => {
    render(<LoadingPlaceholder data-testid="placeholder" />);
    const el = screen.getByTestId('placeholder');
    expect(el).toHaveAttribute('role', 'status');
    expect(el).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('正在加载...')).toBeInTheDocument();
    expect(el.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('支持自定义文案与尺寸', () => {
    render(<LoadingPlaceholder label="页面加载中..." spinnerSize="lg" className="flex-1" />);
    const el = screen.getByText('页面加载中...').parentElement as HTMLElement;
    expect(el.className).toContain('flex-1');
    expect(el.querySelector('.h-9')).not.toBeNull();
  });
});

describe('PageSkeleton', () => {
  it('默认渲染 6 个内容块 + 标题行 + 底部操作区', () => {
    const { container } = render(<PageSkeleton />);
    expect(container.querySelectorAll('.skeleton-shimmer')).toHaveLength(6 + 4);
  });

  it('支持自定义行数', () => {
    const { container } = render(<PageSkeleton rows={2} />);
    expect(container.querySelectorAll('.skeleton-shimmer')).toHaveLength(2 + 4);
  });

  it('透传 className 与其他属性', () => {
    render(<PageSkeleton data-testid="page-skeleton" className="px-4" />);
    const el = screen.getByTestId('page-skeleton');
    expect(el.className).toContain('px-4');
    expect(el.className).toContain('space-y-4');
  });
});
