import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PageErrorBoundary } from '@/components/PageErrorBoundary';

// 用于触发错误的测试子组件
function ThrowError({ message }: { message: string }): never {
  throw new Error(message);
}

// 正常渲染的子组件
function NormalComponent({ text }: { text: string }) {
  return <div data-testid="normal-content">{text}</div>;
}

describe('PageErrorBoundary', () => {
  beforeEach(() => {
    // 抑制测试中故意抛出的错误日志
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('正常渲染子组件', () => {
    render(
      <PageErrorBoundary>
        <NormalComponent text="正常内容" />
      </PageErrorBoundary>,
    );
    expect(screen.getByTestId('normal-content')).toHaveTextContent('正常内容');
  });

  it('子组件抛出错误时显示错误卡片 UI', () => {
    render(
      <PageErrorBoundary>
        <ThrowError message="测试错误" />
      </PageErrorBoundary>,
    );

    expect(screen.getByText('该页面加载失败')).toBeInTheDocument();
    expect(screen.getByText(/测试错误/)).toBeInTheDocument();
  });

  it('点击重试按钮后恢复', async () => {
    const { rerender } = render(
      <PageErrorBoundary>
        <ThrowError message="可恢复错误" />
      </PageErrorBoundary>,
    );

    expect(screen.getByText('该页面加载失败')).toBeInTheDocument();

    // 将子组件替换为正常组件，然后点击重试
    rerender(
      <PageErrorBoundary>
        <NormalComponent text="恢复后的内容" />
      </PageErrorBoundary>,
    );

    const retryButton = screen.getByRole('button', { name: /重试/ });
    retryButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('normal-content')).toHaveTextContent('恢复后的内容');
    });

    expect(screen.queryByText('该页面加载失败')).not.toBeInTheDocument();
  });

  it('resetKey 变化时自动重置错误状态', async () => {
    const { rerender } = render(
      <PageErrorBoundary resetKey="page-a">
        <ThrowError message="页面 A 错误" />
      </PageErrorBoundary>,
    );

    expect(screen.getByText('该页面加载失败')).toBeInTheDocument();

    // 切换 resetKey，同时提供正常子组件
    rerender(
      <PageErrorBoundary resetKey="page-b">
        <NormalComponent text="页面 B 内容" />
      </PageErrorBoundary>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('normal-content')).toHaveTextContent('页面 B 内容');
    });

    expect(screen.queryByText('该页面加载失败')).not.toBeInTheDocument();
  });

  it('resetKey 不变时保持错误状态', () => {
    const { rerender } = render(
      <PageErrorBoundary resetKey="page-a">
        <ThrowError message="初始错误" />
      </PageErrorBoundary>,
    );

    expect(screen.getByText('该页面加载失败')).toBeInTheDocument();

    // 仅 children 变化，resetKey 不变，错误应保持
    rerender(
      <PageErrorBoundary resetKey="page-a">
        <NormalComponent text="新内容" />
      </PageErrorBoundary>,
    );

    expect(screen.getByText('该页面加载失败')).toBeInTheDocument();
  });

  it('错误 UI 包含重试按钮', () => {
    render(
      <PageErrorBoundary>
        <ThrowError message="按钮测试" />
      </PageErrorBoundary>,
    );

    const retryButton = screen.getByRole('button', { name: /重试/ });
    expect(retryButton).toBeInTheDocument();
  });

  it('错误信息以 monospace 格式显示', () => {
    render(
      <PageErrorBoundary>
        <ThrowError message="格式化测试" />
      </PageErrorBoundary>,
    );

    const errorText = screen.getByText(/格式化测试/);
    expect(errorText).toBeInTheDocument();
    expect(errorText.tagName.toLowerCase()).toBe('pre');
  });
});
