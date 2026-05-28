import { useCallback, useEffect } from 'react';
import { storageUtil } from '@/utils/chromeStorage';
import type { ContextMenuPendingData, PageType } from '@/types/storage';

const STORAGE_KEY = 'contextMenu/pendingData' as const;

/** 右键菜单数据过期时间（毫秒） */
export const CONTEXT_MENU_DATA_EXPIRY_MS = 5000;

export interface UseContextMenuDataOptions {
  /** 当前页面的功能标识 */
  featureKey: PageType;
  /** 收到数据时的回调函数 */
  onData: (payload: string) => void;
}

/**
 * 自定义 Hook：处理右键菜单传递的数据
 *
 * 使用方式：
 * 1. 在页面组件中调用此 Hook
 * 2. 传入当前页面的 featureKey 和数据处理回调
 * 3. Hook 会自动从 storage 中读取并消费匹配的数据
 */
export function useContextMenuData({ featureKey, onData }: UseContextMenuDataOptions): void {
  const checkAndConsumeData = useCallback(async () => {
    try {
      const data = await storageUtil.get(STORAGE_KEY, undefined);

      if (!data) return;

      if (data.featureKey !== featureKey) return;

      if (Date.now() - data.timestamp > CONTEXT_MENU_DATA_EXPIRY_MS) {
        await storageUtil.remove(STORAGE_KEY);
        return;
      }

      await storageUtil.remove(STORAGE_KEY);

      onData(data.payload);
    } catch (error) {
      console.error('[useContextMenuData] 处理右键菜单数据失败:', error);
    }
  }, [featureKey, onData]);

  useEffect(() => {
    checkAndConsumeData();
  }, [checkAndConsumeData]);

  useEffect(() => {
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes[STORAGE_KEY]) {
        const newData = changes[STORAGE_KEY].newValue as ContextMenuPendingData | null;
        if (newData && newData.featureKey === featureKey) {
          checkAndConsumeData();
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [featureKey, checkAndConsumeData]);
}

/**
 * 保存右键菜单数据到 storage
 * 由 RouterProvider 或入口组件调用
 */
export async function saveContextMenuData(
  data: Omit<ContextMenuPendingData, 'timestamp'>,
): Promise<void> {
  const pendingData: ContextMenuPendingData = {
    ...data,
    timestamp: Date.now(),
  };
  await storageUtil.set(STORAGE_KEY, pendingData);
}

/**
 * 清除右键菜单待处理数据
 */
export async function clearContextMenuData(): Promise<void> {
  await storageUtil.remove(STORAGE_KEY);
}
