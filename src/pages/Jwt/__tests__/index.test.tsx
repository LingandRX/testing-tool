import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Index from '../index';
import { JWT_INPUT_PLACEHOLDER } from '../constants';

// Test JWT token
// Header: {"alg":"HS256","typ":"JWT"}
// Payload: {"sub":"1234567890","name":"John Doe","iat":1516239022}
// Signature: SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
const VALID_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('Jwt 页面集成测试', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('初始状态应正常渲染输入框和占位符，且不显示解析结果与错误', () => {
    render(<Index />);

    const textarea = screen.getByPlaceholderText(JWT_INPUT_PLACEHOLDER);
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('');

    // 不显示结果面板
    expect(screen.queryByText('HEADER: 算法 & 令牌类型')).not.toBeInTheDocument();
    expect(screen.queryByText('PAYLOAD: 数据')).not.toBeInTheDocument();
    expect(screen.queryByText('签名')).not.toBeInTheDocument();

    // 不显示清空按钮
    expect(screen.queryByRole('button', { name: '清空' })).not.toBeInTheDocument();
  });

  it('输入有效 JWT 后，应成功解析并展示 Header、Payload 和 Signature', () => {
    render(<Index />);

    const textarea = screen.getByPlaceholderText(JWT_INPUT_PLACEHOLDER);
    fireEvent.change(textarea, { target: { value: VALID_JWT } });

    // 防抖 200ms
    act(() => {
      vi.advanceTimersByTime(250);
    });

    // 验证区块标题
    expect(screen.getByText('HEADER: 算法 & 令牌类型')).toBeInTheDocument();
    expect(screen.getByText('PAYLOAD: 数据')).toBeInTheDocument();
    expect(screen.getByText('签名')).toBeInTheDocument();

    // 验证解析内容
    expect(screen.getByText(/"alg":\s*"HS256"/)).toBeInTheDocument();
    expect(screen.getByText(/"typ":\s*"JWT"/)).toBeInTheDocument();
    expect(screen.getByText(/"name":\s*"John Doe"/)).toBeInTheDocument();
    expect(screen.getByText(/"sub":\s*"1234567890"/)).toBeInTheDocument();
    expect(screen.getByText('SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')).toBeInTheDocument();

    // 不应有错误提示
    expect(screen.queryByText(/JWT.*失败/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/JWT.*无效/i)).not.toBeInTheDocument();
  });

  it('输入带 Bearer 前缀的有效 JWT 时应自动去除前缀并正确解析', () => {
    render(<Index />);

    const textarea = screen.getByPlaceholderText(JWT_INPUT_PLACEHOLDER);
    fireEvent.change(textarea, { target: { value: `Bearer ${VALID_JWT}` } });

    // 验证输入值已被去除 Bearer
    expect(textarea).toHaveValue(VALID_JWT);

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.getByText('HEADER: 算法 & 令牌类型')).toBeInTheDocument();
    expect(screen.getByText(/"alg":\s*"HS256"/)).toBeInTheDocument();
  });

  it('输入格式非法的 JWT 时应展示格式错误提示，且不展示结果区域', () => {
    render(<Index />);

    const textarea = screen.getByPlaceholderText(JWT_INPUT_PLACEHOLDER);
    fireEvent.change(textarea, { target: { value: 'invalid.jwt' } });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(
      screen.getByText('JWT 格式无效：应包含 3 个部分（header.payload.signature）'),
    ).toBeInTheDocument();
    expect(screen.queryByText('HEADER: 算法 & 令牌类型')).not.toBeInTheDocument();
    expect(screen.queryByText('PAYLOAD: 数据')).not.toBeInTheDocument();
  });

  it('输入 Header 非法编码的 JWT 时应展示 Header 解析错误', () => {
    render(<Index />);

    const textarea = screen.getByPlaceholderText(JWT_INPUT_PLACEHOLDER);
    // Header 为非合法 JSON
    fireEvent.change(textarea, { target: { value: 'ew.ew.signature' } });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.getByText(/JWT Header 解析失败/)).toBeInTheDocument();
    expect(screen.queryByText('HEADER: 算法 & 令牌类型')).not.toBeInTheDocument();
  });

  it('输入 Payload 非法编码的 JWT 时应展示 Payload 解析错误', () => {
    render(<Index />);

    const textarea = screen.getByPlaceholderText(JWT_INPUT_PLACEHOLDER);
    // Header 正确，Payload 格式非法
    fireEvent.change(textarea, {
      target: { value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ew.signature' },
    });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.getByText(/JWT Payload 解析失败/)).toBeInTheDocument();
    expect(screen.queryByText('HEADER: 算法 & 令牌类型')).not.toBeInTheDocument();
  });

  it('输入无签名 JWT 时能正常解析且签名显示“无签名”', () => {
    render(<Index />);

    const textarea = screen.getByPlaceholderText(JWT_INPUT_PLACEHOLDER);
    // 结尾有点但无签名
    fireEvent.change(textarea, {
      target: {
        value:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.',
      },
    });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.getByText('HEADER: 算法 & 令牌类型')).toBeInTheDocument();
    expect(screen.getByText('无签名')).toBeInTheDocument();
  });

  it('点击清空按钮应清除输入框内容并重置结果视图', () => {
    render(<Index />);

    const textarea = screen.getByPlaceholderText(JWT_INPUT_PLACEHOLDER);
    fireEvent.change(textarea, { target: { value: VALID_JWT } });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.getByText('HEADER: 算法 & 令牌类型')).toBeInTheDocument();

    // 点击清空按钮
    const clearButton = screen.getByRole('button', { name: '清空' });
    fireEvent.click(clearButton);

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(textarea).toHaveValue('');
    expect(screen.queryByText('HEADER: 算法 & 令牌类型')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '清空' })).not.toBeInTheDocument();
  });

  it('处于错误状态时点击清空按钮应清除错误提示', () => {
    render(<Index />);

    const textarea = screen.getByPlaceholderText(JWT_INPUT_PLACEHOLDER);
    fireEvent.change(textarea, { target: { value: 'wrong.jwt' } });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.getByText(/JWT 格式无效/)).toBeInTheDocument();

    const clearButton = screen.getByRole('button', { name: '清空' });
    fireEvent.click(clearButton);

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(textarea).toHaveValue('');
    expect(screen.queryByText(/JWT 格式无效/)).not.toBeInTheDocument();
  });
});
