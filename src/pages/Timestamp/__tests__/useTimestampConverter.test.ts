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
});
