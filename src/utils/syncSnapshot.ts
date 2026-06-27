/**
 * 从 localStorage 获取同步快照（用于消除异步加载产生的首屏闪烁）
 */
export function getSyncSnapshot<T>(
  key: string,
  defaultValue: T,
  validator?: (val: unknown) => val is T,
): T {
  try {
    const val = localStorage.getItem(`snapshot/${key}`);
    if (!val) return defaultValue;
    const parsed = JSON.parse(val) as unknown;
    if (validator) {
      return validator(parsed) ? parsed : defaultValue;
    }
    return (parsed as T) ?? defaultValue;
  } catch (error) {
    console.error(`读取快照失败 (${key}):`, error);
    return defaultValue;
  }
}
