import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';

describe('SwitchButtonGroup 组件', () => {
  const options = [
    { value: 'a', label: '选项A' },
    { value: 'b', label: '选项B' },
  ];

  it('应渲染所有选项按钮', () => {
    render(<SwitchButtonGroup value="a" options={options} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: /选项A/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /选项B/i })).toBeInTheDocument();
  });

  it('应高亮当前选中的按钮', () => {
    render(<SwitchButtonGroup value="a" options={options} onChange={vi.fn()} />);

    const buttonA = screen.getByRole('button', { name: /选项A/i });
    const buttonB = screen.getByRole('button', { name: /选项B/i });

    expect(buttonA).toHaveClass('Mui-selected');
    expect(buttonB).not.toHaveClass('Mui-selected');
  });

  it('点击未选中按钮时应触发 onChange 并传入选中值', () => {
    const handleChange = vi.fn();
    render(<SwitchButtonGroup value="a" options={options} onChange={handleChange} />);

    fireEvent.click(screen.getByRole('button', { name: /选项B/i }));
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('b');
  });

  it('点击已选中按钮时不应触发 onChange', () => {
    const handleChange = vi.fn();
    render(<SwitchButtonGroup value="a" options={options} onChange={handleChange} />);

    fireEvent.click(screen.getByRole('button', { name: /选项A/i }));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('应支持通过 sx 自定义样式', () => {
    const { container } = render(
      <SwitchButtonGroup value="a" options={options} onChange={vi.fn()} sx={{ width: 200 }} />,
    );

    const group = container.querySelector('.MuiToggleButtonGroup-root');
    expect(group).toBeInTheDocument();
  });

  it('应支持 ReactNode 类型的 label', () => {
    const nodeOptions = [{ value: 'x', label: <span data-testid="custom-label">自定义</span> }];
    render(<SwitchButtonGroup value="x" options={nodeOptions} onChange={vi.fn()} />);

    expect(screen.getByTestId('custom-label')).toBeInTheDocument();
  });
});
