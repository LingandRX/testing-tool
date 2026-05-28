import { useEffect, useRef, useState } from 'react';
import { storageUtil } from '@/utils/chromeStorage';
import type { StorageSchema } from '@/types/storage';

/**
 * 从 localStorage 获取同步快照（用于消除异步加载产生的首屏闪烁）
 */
const getSyncSnapshot = <T>(
  key: string,
  defaultValue: T,
  validator?: (val: unknown) => val is T,
): T => {
  try {
    const val = localStorage.getItem(`snapshot/${key}`);
    if (!val) return defaultValue;
    const parsed = JSON.parse(val) as unknown;
    if (validator) {
      return validator(parsed) ? parsed : defaultValue;
    }
    return (parsed as T) ?? defaultValue;
  } catch {
    return defaultValue;
  }
};

export const useStorageState = <K extends keyof StorageSchema>(
  key: K,
  defaultValue: StorageSchema[K],
  validator?: (val: unknown) => val is StorageSchema[K],
) => {
  const [value, setValue] = useState<StorageSchema[K]>(() =>
    getSyncSnapshot(key as string, defaultValue, validator),
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const hasLoadedFromStorage = useRef(false);

  // Only load from storage once on mount
  useEffect(() => {
    if (hasLoadedFromStorage.current) return;

    let cancelled = false;

    const loadState = async () => {
      try {
        const savedValue = await storageUtil.get(key, defaultValue);
        if (cancelled) return;
        if (savedValue !== undefined) {
          if (validator) {
            setValue(validator(savedValue) ? savedValue : defaultValue);
          } else {
            setValue(savedValue);
          }
        }
      } catch (error) {
        console.error(`加载状态失败 (${key}):`, error);
      } finally {
        if (!cancelled) {
          setIsInitialized(true);
          hasLoadedFromStorage.current = true;
        }
      }
    };

    loadState().catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [defaultValue, key, validator]);

  // Save to storage and localStorage snapshot when value changes (after initial load)
  useEffect(() => {
    if (!isInitialized) return;

    const saveState = async () => {
      try {
        await storageUtil.set(key, value);
        localStorage.setItem(`snapshot/${key}`, JSON.stringify(value));
      } catch (error) {
        console.error(`保存状态失败 (${key}):`, error);
      }
    };

    saveState().catch(console.error);
  }, [value, isInitialized, key]);

  return [value, setValue, isInitialized] as const;
};
