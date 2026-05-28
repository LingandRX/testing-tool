import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import Base64ConverterPage from '../index';

// Mock getEntryPointType
vi.mock('@/config/features', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/config/features')>();
  return {
    ...actual,
    getEntryPointType: () => 'sidepanel',
  };
});

// Mock 子组件
vi.mock('../TextMode', () => ({
  default: ({ onSwitchToImageMode }: { onSwitchToImageMode?: () => void }) => (
    <div data-testid="text-mode">
      TextMode
      {onSwitchToImageMode && <button onClick={onSwitchToImageMode}>switchToImage</button>}
    </div>
  ),
}));

vi.mock('../Base64ConverterSection', () => ({
  default: ({ mode }: { mode: string }) => <div data-testid={`${mode}-mode`}>{mode}</div>,
}));

const waitForStorageInit = () =>
  act(async () => {
    await Promise.resolve();
  });

describe('Base64ConverterPage', () => {
  it('应该默认渲染文本模式', async () => {
    render(<Base64ConverterPage />);
    await waitForStorageInit();
    expect(screen.getByTestId('text-mode')).toBeInTheDocument();
  });

  it('应该渲染模式切换按钮', async () => {
    render(<Base64ConverterPage />);
    await waitForStorageInit();
    expect(screen.getByText('文本')).toBeInTheDocument();
    expect(screen.getByText('文件')).toBeInTheDocument();
    expect(screen.getByText('图像')).toBeInTheDocument();
  });

  it('切换到文件模式应该渲染 FileMode', async () => {
    render(<Base64ConverterPage />);
    await waitForStorageInit();
    fireEvent.click(screen.getByText('文件'));
    await waitFor(() => {
      expect(screen.getByTestId('file-mode')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('text-mode')).not.toBeInTheDocument();
  });

  it('切换到图像模式应该渲染 ImageMode', async () => {
    render(<Base64ConverterPage />);
    await waitForStorageInit();
    fireEvent.click(screen.getByText('图像'));
    await waitFor(() => {
      expect(screen.getByTestId('image-mode')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('text-mode')).not.toBeInTheDocument();
  });
});
