import { useState, useEffect, useRef } from 'react';
import { storageUtil } from '@/utils/chromeStorage';
import type { StorageSchema } from '@/types/storage';

export const useStorageState = <K extends keyof StorageSchema>(
  key: K,
  defaultValue: StorageSchema[K],
) => {
  const [value, setValue] = useState(defaultValue);
  const [isInitialized, setIsInitialized] = useState(false);
  const hasLoadedFromStorage = useRef(false);

  // Only load from storage once on mount
  useEffect(() => {
    if (hasLoadedFromStorage.current) return;

    const loadState = async () => {
      try {
        const savedValue = await storageUtil.get(key, defaultValue);
        if (savedValue !== undefined) {
          setValue(savedValue);
        }
      } catch (error) {
        console.error(`加载状态失败 (${key}):`, error);
      } finally {
        setIsInitialized(true);
        hasLoadedFromStorage.current = true;
      }
    };

    loadState();
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps -- defaultValue intentionally excluded to prevent infinite loops

  // Save to storage when value changes (after initial load)
  useEffect(() => {
    if (!isInitialized) return;

    const saveState = async () => {
      try {
        await storageUtil.set(key, value);
      } catch (error) {
        console.error(`保存状态失败 (${key}):`, error);
      }
    };

    saveState();
  }, [value, isInitialized, key]);

  return [value, setValue, isInitialized] as const;
};
