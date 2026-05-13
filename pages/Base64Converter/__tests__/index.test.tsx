import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Base64ConverterPage from '../index';

// Mock 子组件
vi.mock('../TextMode', () => ({
  default: () => <div data-testid="text-mode">TextMode</div>,
}));

vi.mock('../FileMode', () => ({
  default: () => <div data-testid="file-mode">FileMode</div>,
}));

vi.mock('../ImageMode', () => ({
  default: () => <div data-testid="image-mode">ImageMode</div>,
}));

describe('Base64ConverterPage', () => {
  it('应该默认渲染文本模式', () => {
    render(<Base64ConverterPage />);
    expect(screen.getByTestId('text-mode')).toBeInTheDocument();
  });

  it('应该渲染模式切换按钮', () => {
    render(<Base64ConverterPage />);
    expect(screen.getByText('base64Converter:textMode')).toBeInTheDocument();
    expect(screen.getByText('base64Converter:fileMode')).toBeInTheDocument();
    expect(screen.getByText('base64Converter:imageMode')).toBeInTheDocument();
  });

  it('切换到文件模式应该渲染 FileMode', () => {
    render(<Base64ConverterPage />);
    fireEvent.click(screen.getByText('base64Converter:fileMode'));
    expect(screen.getByTestId('file-mode')).toBeInTheDocument();
    expect(screen.queryByTestId('text-mode')).not.toBeInTheDocument();
  });

  it('切换到图像模式应该渲染 ImageMode', () => {
    render(<Base64ConverterPage />);
    fireEvent.click(screen.getByText('base64Converter:imageMode'));
    expect(screen.getByTestId('image-mode')).toBeInTheDocument();
    expect(screen.queryByTestId('text-mode')).not.toBeInTheDocument();
  });

  it('应该渲染页面标题', () => {
    render(<Base64ConverterPage />);
    expect(screen.getByText('base64Converter:pageTitle')).toBeInTheDocument();
    expect(screen.getByText('base64Converter:pageSubtitle')).toBeInTheDocument();
  });
});
