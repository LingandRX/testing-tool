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

    // 选中的按钮有 bg-white text-blue-600 shadow-sm 类
    expect(buttonA).toHaveClass('bg-white', 'text-blue-600', 'shadow-sm');
    // 未选中的按钮有 text-gray-500 类
    expect(buttonB).toHaveClass('text-gray-500');
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
    // 新组件每次点击都会触发 onChange
    expect(handleChange).toHaveBeenCalledWith('a');
  });

  it('应支持通过 sx 自定义样式', () => {
    const { container } = render(
      <SwitchButtonGroup value="a" options={options} onChange={vi.fn()} sx={{ width: 200 }} />,
    );

    const group = container.querySelector('.flex.gap-1');
    expect(group).toBeInTheDocument();
  });

  it('应支持 size 属性', () => {
    render(<SwitchButtonGroup value="a" options={options} onChange={vi.fn()} size="small" />);

    const button = screen.getByRole('button', { name: /选项A/i });
    expect(button).toHaveClass('text-xs');
  });

  it('应支持 buttonSx 自定义按钮样式', () => {
    render(
      <SwitchButtonGroup
        value="a"
        options={options}
        onChange={vi.fn()}
        buttonSx={{ textTransform: 'uppercase' }}
      />,
    );

    const button = screen.getByRole('button', { name: /选项A/i });
    expect(button).toBeInTheDocument();
  });

  it('应支持 ReactNode 类型的 label', () => {
    const nodeOptions = [{ value: 'x', label: <span data-testid="custom-label">自定义</span> }];
    render(<SwitchButtonGroup value="x" options={nodeOptions} onChange={vi.fn()} />);

    expect(screen.getByTestId('custom-label')).toBeInTheDocument();
  });

  it('默认按钮样式应禁止文字换行', () => {
    render(<SwitchButtonGroup value="a" options={options} onChange={vi.fn()} />);

    const button = screen.getByRole('button', { name: /选项A/i });
    expect(button).toHaveClass('whitespace-nowrap');
  });

  it('buttonSx 传入时应覆盖默认换行样式', () => {
    render(
      <SwitchButtonGroup
        value="a"
        options={options}
        onChange={vi.fn()}
        buttonSx={{ whiteSpace: 'normal' }}
      />,
    );

    const button = screen.getByRole('button', { name: /选项A/i });
    expect(button).toBeInTheDocument();
  });

  describe('number 类型支持', () => {
    const numberOptions = [
      { value: 2, label: '2' },
      { value: 4, label: '4' },
    ];

    it('应支持 number 类型的 value 渲染', () => {
      render(<SwitchButtonGroup value={2} options={numberOptions} onChange={vi.fn()} />);

      expect(screen.getByRole('button', { name: /^2$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^4$/i })).toBeInTheDocument();
    });

    it('应高亮 number 类型的当前选中项', () => {
      render(<SwitchButtonGroup value={4} options={numberOptions} onChange={vi.fn()} />);

      const button2 = screen.getByRole('button', { name: /^2$/i });
      const button4 = screen.getByRole('button', { name: /^4$/i });

      expect(button2).toHaveClass('text-gray-500');
      expect(button4).toHaveClass('bg-white', 'text-blue-600', 'shadow-sm');
    });

    it('点击 number 选项时应传回 number 值', () => {
      const handleChange = vi.fn();
      render(<SwitchButtonGroup value={2} options={numberOptions} onChange={handleChange} />);

      fireEvent.click(screen.getByRole('button', { name: /^4$/i }));
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(4);
    });
  });
});
