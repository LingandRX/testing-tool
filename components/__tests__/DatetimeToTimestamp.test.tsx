import { render, screen } from '@testing-library/react';
import { DatetimeToTimestamp } from '../DatetimeToTimestamp';

describe('DatetimeToTimestamp', () => {
  it('应该正确渲染组件', () => {
    render(<DatetimeToTimestamp />);
    expect(screen.getByLabelText('输入日期时间')).toBeInTheDocument();
    expect(screen.getByText('转换')).toBeInTheDocument();
    expect(screen.getByLabelText('转换结果')).toBeInTheDocument();
  });

  it('应该初始化为当前日期时间', () => {
    render(<DatetimeToTimestamp />);
    const input = screen.getByLabelText('输入日期时间') as HTMLInputElement;
    expect(input.value).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/);
  });
});
