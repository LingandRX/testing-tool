import { render, screen } from '@testing-library/react';
import { TimestampToDatetime } from '../TimestampToDatetime';

describe('TimestampToDatetime', () => {
  it('应该正确渲染组件', () => {
    render(<TimestampToDatetime />);
    expect(screen.getByLabelText('输入时间戳')).toBeInTheDocument();
    expect(screen.getByText('转换')).toBeInTheDocument();
    expect(screen.getByLabelText('转换结果')).toBeInTheDocument();
  });

  it('应该初始化为当前时间戳', () => {
    render(<TimestampToDatetime />);
    const input = screen.getByLabelText('输入时间戳') as HTMLInputElement;
    expect(input.value).toMatch(/^\d{13}$/);
  });
});
