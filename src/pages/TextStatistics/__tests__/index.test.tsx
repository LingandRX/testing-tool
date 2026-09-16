import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Index from '../index';

describe('TextStatistics 页面级测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const getStatValue = (label: string): string | null => {
    const labelElement = screen.getByText(label);
    const card = labelElement.closest('div');
    return card?.querySelector('.tabular-nums')?.textContent ?? null;
  };

  it('初始状态应渲染空输入框及全 0 / 0 B 指标', () => {
    render(<Index />);

    const textarea = screen.getByPlaceholderText('在此输入或粘贴文本...');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('');

    expect(getStatValue('字符数')).toBe('0');
    expect(getStatValue('单词数')).toBe('0');
    expect(getStatValue('行数')).toBe('0');
    expect(getStatValue('字节大小')).toBe('0 B');

    // 初始状态下清空按钮不应展示
    expect(screen.queryByRole('button', { name: '清空' })).not.toBeInTheDocument();
  });

  it('输入纯英文单行文本后，正确更新各项指标', () => {
    render(<Index />);

    const textarea = screen.getByPlaceholderText('在此输入或粘贴文本...');
    fireEvent.change(textarea, { target: { value: 'Hello world' } });

    expect(textarea).toHaveValue('Hello world');
    expect(getStatValue('字符数')).toBe('11');
    expect(getStatValue('单词数')).toBe('2');
    expect(getStatValue('行数')).toBe('1');
    expect(getStatValue('字节大小')).toBe('11 B');
  });

  it('输入多行中文文本后，正确更新字符数、单词数、行数与 UTF-8 字节大小', () => {
    render(<Index />);

    const textarea = screen.getByPlaceholderText('在此输入或粘贴文本...');
    // "你好世界" (4 chars, 2 words in Intl.Segmenter, 12 bytes)
    // "\n" (1 line break, 1 byte)
    // "测试工具" (4 chars, 2 words, 12 bytes)
    // Total: 4 + 1 + 4 = 9 chars, 4 words, 2 lines, 12 + 1 + 12 = 25 bytes
    const chineseMultiLine = '你好世界\n测试工具';
    fireEvent.change(textarea, { target: { value: chineseMultiLine } });

    expect(getStatValue('字符数')).toBe('9');
    expect(getStatValue('单词数')).toBe('4');
    expect(getStatValue('行数')).toBe('2');
    expect(getStatValue('字节大小')).toBe('25 B');
  });

  it('输入连续换行符时，正确统计行数且单词数为 0', () => {
    render(<Index />);

    const textarea = screen.getByPlaceholderText('在此输入或粘贴文本...');
    fireEvent.change(textarea, { target: { value: '\n\n\n' } });

    expect(getStatValue('字符数')).toBe('3');
    expect(getStatValue('单词数')).toBe('0');
    expect(getStatValue('行数')).toBe('4');
    expect(getStatValue('字节大小')).toBe('3 B');
  });

  it('输入中英文混合文本后，正确统计各项数据', () => {
    render(<Index />);

    const textarea = screen.getByPlaceholderText('在此输入或粘贴文本...');
    // "Hello 你好\nWorld"
    // "Hello" (5) + " " (1) + "你好" (2) + "\n" (1) + "World" (5) = 14 chars
    // Words: "Hello", "你好", "World" = 3 words
    // Lines: 2
    // Bytes: 5 + 1 + 6 + 1 + 5 = 18 bytes
    fireEvent.change(textarea, { target: { value: 'Hello 你好\nWorld' } });

    expect(getStatValue('字符数')).toBe('14');
    expect(getStatValue('单词数')).toBe('3');
    expect(getStatValue('行数')).toBe('2');
    expect(getStatValue('字节大小')).toBe('18 B');
  });

  it('输入大容量文本时，字节大小应正确格式化为 KB', () => {
    render(<Index />);

    const textarea = screen.getByPlaceholderText('在此输入或粘贴文本...');
    // 1024 字节以上的文本
    const largeText = 'a'.repeat(2048);
    fireEvent.change(textarea, { target: { value: largeText } });

    expect(getStatValue('字符数')).toBe('2048');
    expect(getStatValue('单词数')).toBe('1');
    expect(getStatValue('行数')).toBe('1');
    expect(getStatValue('字节大小')).toBe('2.0 KB');
  });

  it('点击清空按钮应重置输入框内容与统计指标', () => {
    render(<Index />);

    const textarea = screen.getByPlaceholderText('在此输入或粘贴文本...');
    fireEvent.change(textarea, { target: { value: '待清空的内容' } });

    expect(getStatValue('字符数')).not.toBe('0');

    // 清空按钮应该出现
    const clearButton = screen.getByRole('button', { name: '清空' });
    expect(clearButton).toBeInTheDocument();

    // 点击清空
    fireEvent.click(clearButton);

    expect(textarea).toHaveValue('');
    expect(getStatValue('字符数')).toBe('0');
    expect(getStatValue('单词数')).toBe('0');
    expect(getStatValue('行数')).toBe('0');
    expect(getStatValue('字节大小')).toBe('0 B');

    // 清空按钮应隐藏
    expect(screen.queryByRole('button', { name: '清空' })).not.toBeInTheDocument();
  });
});
