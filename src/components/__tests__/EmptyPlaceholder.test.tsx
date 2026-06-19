import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyPlaceholder from '@/components/EmptyPlaceholder';

describe('EmptyPlaceholder 组件', () => {
  it('应渲染字符串提示文本', () => {
    render(<EmptyPlaceholder>{'请输入内容'}</EmptyPlaceholder>);

    expect(screen.getByText('请输入内容')).toBeInTheDocument();
  });

  it('应应用规范空状态容器样式', () => {
    const { container } = render(<EmptyPlaceholder>{'提示'}</EmptyPlaceholder>);

    const placeholder = container.firstChild;
    expect(placeholder).toHaveClass(
      'rounded-xl',
      'bg-muted/30',
      'border-dashed',
      'border-border/80',
      'min-h-[120px]',
    );
  });

  it('应支持 className 自定义容器样式', () => {
    const { container } = render(
      <EmptyPlaceholder className="flex-1 min-h-[320px]">{'提示'}</EmptyPlaceholder>,
    );

    expect(container.firstChild).toHaveClass('flex-1', 'min-h-[320px]');
  });

  it('应支持 messageClassName 自定义文本样式', () => {
    render(<EmptyPlaceholder messageClassName="text-sm max-w-none">{'提示'}</EmptyPlaceholder>);

    expect(screen.getByText('提示')).toHaveClass('text-sm', 'max-w-none');
  });

  it('应支持 ReactNode 类型的 children', () => {
    render(
      <EmptyPlaceholder>
        <span data-testid="custom-content">自定义内容</span>
      </EmptyPlaceholder>,
    );

    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
  });
});
