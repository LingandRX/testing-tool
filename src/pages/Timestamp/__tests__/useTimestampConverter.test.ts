import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTimestampConverter } from '../useTimestampConverter';

describe('useTimestampConverter Hook', () => {
  it('连续多次点击/设置相同 mode 时不应误将上一次 result 填入 input', () => {
    const { result } = renderHook(() => useTimestampConverter());

    // 初始 mode 为 ts2dt
    expect(result.current.mode).toBe('ts2dt');

    // 第一次点击/切换为 dt2ts
    act(() => {
      result.current.setMode('dt2ts');
    });
    expect(result.current.mode).toBe('dt2ts');
    const inputAfterFirstClick = result.current.input;
    expect(inputAfterFirstClick).toMatch(/^\d{4}\/\d{2}\/\d{2}/); // 应当是日期格式

    // 第二次再次点击/切换为相同的 dt2ts
    act(() => {
      result.current.setMode('dt2ts');
    });
    // input 保持为日期格式，不能被上一步算出的时间戳 result 覆写
    expect(result.current.input).toBe(inputAfterFirstClick);
    expect(result.current.error).toBe('');
  });

  it('即使输入极大的非法数字或异常日期格式，也不应抛出 RangeError 崩溃', () => {
    const { result } = renderHook(() => useTimestampConverter());

    act(() => {
      result.current.setMode('dt2ts');
    });

    // 强行把 dt2ts 模式下的 input 设为超长数字字符串
    act(() => {
      result.current.setInput('99999999999999999');
    });

    expect(() => {
      void result.current.result;
    }).not.toThrow();

    expect(result.current.error).toBe('无效的日期格式');
  });

  it('在 ts2dt 模式下从 ms 切换到 s 时，如果是 13 位毫秒应自动换算为 10 位秒，不报错', () => {
    const { result } = renderHook(() => useTimestampConverter());

    act(() => {
      result.current.setInput('1700000000000');
      result.current.setUnit('ms');
    });

    expect(result.current.error).toBe('');
    expect(result.current.result).not.toBe('');

    // 切换到秒
    act(() => {
      result.current.setUnit('s');
    });

    expect(result.current.unit).toBe('s');
    expect(result.current.input).toBe('1700000000');
    expect(result.current.error).toBe('');
  });

  it('在 ts2dt 模式下用户手动输入 10 位秒级时间戳但单位误选为 ms 时，切换到 s 保持原数值并正确解析', () => {
    const { result } = renderHook(() => useTimestampConverter());

    act(() => {
      // 用户误在 ms 下输入了 10 位时间戳
      result.current.setInput('1700000000');
    });

    // 切换到秒纠正单位
    act(() => {
      result.current.setUnit('s');
    });

    // 保持 1700000000 不变，而不是除以 1000
    expect(result.current.input).toBe('1700000000');
    expect(result.current.error).toBe('');
    expect(result.current.result).toContain('2023');
  });

  it('在 ts2dt 模式下从 s 切换到 ms 时，如果是 10 位秒应自动换算为 13 位毫秒', () => {
    const { result } = renderHook(() => useTimestampConverter());

    act(() => {
      result.current.setUnit('s');
      result.current.setInput('1700000000');
    });

    // 切换回毫秒
    act(() => {
      result.current.setUnit('ms');
    });

    expect(result.current.input).toBe('1700000000000');
    expect(result.current.error).toBe('');
  });
});
