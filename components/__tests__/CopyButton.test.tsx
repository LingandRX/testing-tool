import { render, screen, fireEvent } from '@testing-library/react';
import CopyButton from '../CopyButton';
import { vi } from 'vitest';

describe('CopyButton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('应该正确渲染默认文本', () => {
    render(<CopyButton textToCopy="test" />);
    expect(screen.getByText('复制')).toBeInTheDocument();
  });

  it('应该正确渲染自定义按钮文本', () => {
    render(<CopyButton textToCopy="test" buttonText="Custom Copy" />);
    expect(screen.getByText('Custom Copy')).toBeInTheDocument();
  });

  it('点击按钮时应该复制文本到剪贴板', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
    });

    render(<CopyButton textToCopy="test content" />);
    const button = screen.getByText('复制');

    fireEvent.click(button);
    vi.advanceTimersByTime(300);

    expect(writeTextMock).toHaveBeenCalledWith('test content');
  });

  it('当没有提供要复制的文本时，应该在控制台警告', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(<CopyButton textToCopy="" />);
    const button = screen.getByText('复制');

    fireEvent.click(button);

    expect(consoleWarnSpy).toHaveBeenCalledWith('没有提供要复制的文本');
    consoleWarnSpy.mockRestore();
  });
});
