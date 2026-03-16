import { render, screen, fireEvent } from '@testing-library/react';
import { TimestampExecution } from '../TimestampExecution';
import { vi } from 'vitest';

describe('TimestampExecution', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该正确渲染组件', () => {
    render(<TimestampExecution />);
    expect(screen.getByText('切换单位')).toBeInTheDocument();
    expect(screen.getByText('复制')).toBeInTheDocument();
    expect(screen.getByText('停止')).toBeInTheDocument();
  });

  it('初始状态应该显示毫秒单位', () => {
    render(<TimestampExecution />);
    expect(screen.getByText('毫秒')).toBeInTheDocument();
  });

  it('点击切换单位按钮应该切换为秒显示', () => {
    render(<TimestampExecution />);
    const toggleUnitButton = screen.getByText('切换单位');
    fireEvent.click(toggleUnitButton);
    expect(screen.getByText('秒')).toBeInTheDocument();
  });

  it('点击停止按钮应该停止时间戳自动更新', () => {
    render(<TimestampExecution />);
    const toggleButton = screen.getByText('停止');
    fireEvent.click(toggleButton);
    expect(screen.getByText('开始')).toBeInTheDocument();
  });
});
