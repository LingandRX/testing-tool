import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import JsonDiffPanel from '../JsonDiffPanel';

describe('JsonDiffPanel', () => {
  it('展开态渲染标题与输入框', () => {
    render(
      <JsonDiffPanel
        title="数据 A（原始）"
        placeholder="x"
        value=""
        onChange={() => {}}
        collapsed={false}
        onToggleCollapse={() => {}}
        preview=""
      />,
    );
    expect(screen.getByText('数据 A（原始）')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('x')).toBeInTheDocument();
  });

  it('折叠态渲染预览并隐藏输入框', () => {
    render(
      <JsonDiffPanel
        title="数据 A（原始）"
        placeholder="x"
        value=""
        onChange={() => {}}
        collapsed={true}
        onToggleCollapse={() => {}}
        preview="abc（点击展开）"
      />,
    );
    expect(screen.getByText('abc（点击展开）')).toBeInTheDocument();
    const input = screen.getByPlaceholderText('x');
    expect(input.closest('.opacity-0')).toBeInTheDocument();
  });

  it('点击标题可切换折叠', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <JsonDiffPanel
        title="T"
        placeholder="x"
        value=""
        onChange={() => {}}
        collapsed={false}
        onToggleCollapse={onToggle}
        preview=""
      />,
    );
    await user.click(screen.getByText('T'));
    expect(onToggle).toHaveBeenCalled();
  });
});
