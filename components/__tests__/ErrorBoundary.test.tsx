import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// 用于触发错误的测试子组件
function ThrowError({ message }: { message: string }): never {
  throw new Error(message);
}

// 正常渲染的子组件
function NormalComponent({ text }: { text: string }) {
  return <div data-testid="normal-content">{text}</div>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // 抑制测试中故意抛出的错误日志
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('正常渲染子组件', () => {
    render(
      <ErrorBoundary>
        <NormalComponent text="正常内容" />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('normal-content')).toHaveTextContent('正常内容');
  });

  it('子组件抛出错误时显示错误 UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError message="测试错误" />
      </ErrorBoundary>,
    );

    expect(screen.getByText('糟糕，出了点问题')).toBeInTheDocument();
    expect(screen.getByText(/测试错误/)).toBeInTheDocument();
  });

  it('children 变化时重置错误状态', async () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError message="初始错误" />
      </ErrorBoundary>,
    );

    expect(screen.getByText('糟糕，出了点问题')).toBeInTheDocument();

    // 切换到正常子组件
    rerender(
      <ErrorBoundary>
        <NormalComponent text="恢复后的内容" />
      </ErrorBoundary>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('normal-content')).toHaveTextContent('恢复后的内容');
    });

    expect(screen.queryByText('糟糕，出了点问题')).not.toBeInTheDocument();
  });

  it('相同的 children 不重置错误状态', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError message="相同子组件错误" />
      </ErrorBoundary>,
    );

    expect(screen.getByText('糟糕，出了点问题')).toBeInTheDocument();

    // 用相同的 children rerender
    rerender(
      <ErrorBoundary>
        <ThrowError message="相同子组件错误" />
      </ErrorBoundary>,
    );

    expect(screen.getByText('糟糕，出了点问题')).toBeInTheDocument();
  });

  it('错误 UI 包含刷新按钮', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError message="按钮测试" />
      </ErrorBoundary>,
    );

    const refreshButton = screen.getByRole('button', { name: /刷新应用/ });
    expect(refreshButton).toBeInTheDocument();

    refreshButton.click();
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });
});
