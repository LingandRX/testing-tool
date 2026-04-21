import { useState, useEffect } from 'react';
import { storageUtil } from '@/utils/chromeStorage';

export const useStorageState = (
  key: 'qrCode/urlExpanded' | 'qrCode/qrExpanded',
  defaultValue: boolean,
) => {
  const [value, setValue] = useState(defaultValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      try {
        const savedValue = await storageUtil.get(key, defaultValue);
        setValue(savedValue ?? defaultValue);
      } catch (error) {
        console.error(`加载状态失败 (${key}):`, error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadState();
  }, [key, defaultValue]);

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
