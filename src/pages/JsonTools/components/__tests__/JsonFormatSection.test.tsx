import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import JsonFormatSection from '../JsonFormatSection';

describe('JsonFormatSection', () => {
  it('渲染输入面板标题与缩进/键名排序工具栏', () => {
    render(<JsonFormatSection />);
    expect(screen.getByText('JSON 输入')).toBeInTheDocument();
    expect(screen.getByText('缩进')).toBeInTheDocument();
    expect(screen.getByText('键名排序')).toBeInTheDocument();
  });

  it('输入无效 JSON 时不渲染结果面板与占位区', async () => {
    render(<JsonFormatSection />);
    const input = screen.getByPlaceholderText('输入需要格式化的 JSON...');
    fireEvent.change(input, { target: { value: '{ invalid json ' } });
    await waitFor(() => {
      expect(screen.queryByText('格式化结果')).not.toBeInTheDocument();
    });
    expect(
      screen.queryByText('请修正上方 JSON 的语法错误以开启实时流式格式化'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('输入 JSON 后点击格式化')).not.toBeInTheDocument();
  });

  it('输入有效 JSON 后渲染格式化结果面板', async () => {
    render(<JsonFormatSection />);
    const input = screen.getByPlaceholderText('输入需要格式化的 JSON...');
    fireEvent.change(input, { target: { value: '{"a":1,"b":2}' } });
    await waitFor(() => {
      expect(screen.getByText('格式化结果')).toBeInTheDocument();
    });
    expect(screen.getByText(/"a": 1/)).toBeInTheDocument();
    expect(screen.getByText(/"b": 2/)).toBeInTheDocument();
  });

  it('点击标题可折叠输入面板', async () => {
    const user = userEvent.setup();
    render(<JsonFormatSection />);
    const input = screen.getByPlaceholderText('输入需要格式化的 JSON...');
    fireEvent.change(input, { target: { value: '{"a":1}' } });
    await waitFor(() => {
      expect(screen.getByText('格式化结果')).toBeInTheDocument();
    });

    await user.click(screen.getByText('JSON 输入'));

    // 折叠后输入框内容区隐藏
    await waitFor(() => {
      expect(input.closest('.opacity-0')).toBeInTheDocument();
    });
    // 折叠态展示单行预览
    expect(screen.getByText('{"a":1}（点击展开）')).toBeInTheDocument();
  });
});
