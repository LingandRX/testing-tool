import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useJsonTools } from '../useJsonTools';

describe('useJsonTools 窄屏手动比对', () => {
  it('canCompare 在两侧输入合法前为 false', () => {
    const { result } = renderHook(() => useJsonTools());
    expect(result.current.canCompare).toBe(false);

    act(() => result.current.setLeftInput('{"a":1}'));
    expect(result.current.canCompare).toBe(false);

    act(() => result.current.setRightInput('{"b":2}'));
    expect(result.current.canCompare).toBe(true);
  });

  it('非法 JSON 时 canCompare 为 false', () => {
    const { result } = renderHook(() => useJsonTools());
    act(() => {
      result.current.setLeftInput('{"a":1}');
      result.current.setRightInput('not json');
    });
    expect(result.current.canCompare).toBe(false);
  });

  it('handleCompare 生成结果并自动折叠两侧面板', () => {
    const { result } = renderHook(() => useJsonTools());
    act(() => {
      result.current.setLeftInput('{"a":1}');
      result.current.setRightInput('{"a":2}');
    });
    act(() => result.current.handleCompare());

    expect(result.current.hasCompared).toBe(true);
    expect(result.current.activeResult).not.toBeNull();
    expect(result.current.total).toBeGreaterThan(0);
    expect(result.current.collapsedA).toBe(true);
    expect(result.current.collapsedB).toBe(true);
  });

  it('比对后修改输入会重置结果，但保留折叠态', () => {
    const { result } = renderHook(() => useJsonTools());
    act(() => {
      result.current.setLeftInput('{"a":1}');
      result.current.setRightInput('{"a":2}');
    });
    act(() => result.current.handleCompare());
    expect(result.current.hasCompared).toBe(true);
    expect(result.current.collapsedA).toBe(true);
    expect(result.current.collapsedB).toBe(true);

    act(() => result.current.setLeftInput('{"a":3}'));
    expect(result.current.hasCompared).toBe(false);
    expect(result.current.activeResult).toBeNull();
    expect(result.current.collapsedA).toBe(true);
    expect(result.current.collapsedB).toBe(true);
  });

  it('toggleCollapseA/B 可逆切换折叠态', () => {
    const { result } = renderHook(() => useJsonTools());
    expect(result.current.collapsedA).toBe(false);
    act(() => result.current.toggleCollapseA());
    expect(result.current.collapsedA).toBe(true);
    act(() => result.current.toggleCollapseA());
    expect(result.current.collapsedA).toBe(false);
  });
});
