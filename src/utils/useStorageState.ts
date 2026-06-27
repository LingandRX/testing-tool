import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { storageUtil } from '@/utils/chromeStorage';
import { getSyncSnapshot } from '@/utils/syncSnapshot';
import type { StorageSchema } from '@/types/storage';

export const useStorageState = <K extends keyof StorageSchema>(
  key: K,
  defaultValue: StorageSchema[K],
  validator?: (val: unknown) => val is StorageSchema[K],
) => {
  const [value, setValueInternal] = useState<StorageSchema[K]>(() =>
    getSyncSnapshot(key as string, defaultValue, validator),
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const hasLoadedFromStorage = useRef(false);
  const loadSucceededRef = useRef(false);
  const userModifiedRef = useRef(false);

  const setValue = useCallback<Dispatch<SetStateAction<StorageSchema[K]>>>((next) => {
    userModifiedRef.current = true;
    setValueInternal(next);
  }, []);

  useEffect(() => {
    if (hasLoadedFromStorage.current) return;

    let cancelled = false;

    const loadState = async () => {
      try {
        const savedValue = await storageUtil.get(key, defaultValue);
        if (cancelled) return;
        loadSucceededRef.current = true;
        if (savedValue !== undefined) {
          if (validator) {
            setValueInternal(validator(savedValue) ? savedValue : defaultValue);
          } else {
            setValueInternal(savedValue);
          }
        }
      } catch (error) {
        console.error(`加载状态失败 (${key}):`, error);
        loadSucceededRef.current = false;
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

  useEffect(() => {
    if (!isInitialized) return;
    if (!loadSucceededRef.current && !userModifiedRef.current) return;

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
