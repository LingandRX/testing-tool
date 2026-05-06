import type { CleaningResult, StorageCleanerOptions, StorageCleanResult } from '@/types/storage';

const RESTRICTED_PROTOCOLS = [
  'chrome:',
  'chrome-extension:',
  'about:',
  'edge:',
  'view-source:',
  'file:',
  'data:',
] as const;

export async function getCurrentTab() {
  // For popup pages, we need to get the active tab from the browser window that triggered the popup.
  // We should ONLY care about the currently active tab in the last focused window.
  // If it's a restricted URL, we return it anyway and let the caller handle the error display.

  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });

  if (tab) {
    return tab;
  }

  // Fallback for cases where lastFocusedWindow might not work as expected (e.g. certain sidepanel scenarios)
  const [fallbackTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  return fallbackTab;
}

export function isRestrictedUrl(url?: string): boolean {
  if (!url) return true;
  return RESTRICTED_PROTOCOLS.some((p) => url.startsWith(p));
}

export async function getCookieSize(url: string): Promise<number> {
  try {
    const cookies = await chrome.cookies.getAll({ url });
    // 估算：名称 + 值 + 域名 + 路径 的长度
    return cookies.reduce(
      (acc, c) =>
        acc + c.name.length + c.value.length + (c.domain?.length || 0) + (c.path?.length || 0),
      0,
    );
  } catch (error) {
    console.error('Failed to get cookie size:', error);
    return 0;
  }
}

export async function getLocalStorageSize(tabId: number): Promise<number> {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        try {
          return Object.entries(localStorage).reduce((acc, [k, v]) => acc + k.length + v.length, 0);
        } catch {
          return 0;
        }
      },
    });
    return (result?.result as number) || 0;
  } catch (error) {
    console.error('Failed to get LocalStorage size:', error);
    return 0;
  }
}

export async function getSessionStorageSize(tabId: number): Promise<number> {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        try {
          return Object.entries(sessionStorage).reduce(
            (acc, [k, v]) => acc + k.length + v.length,
            0,
          );
        } catch {
          return 0;
        }
      },
    });
    return (result?.result as number) || 0;
  } catch (error) {
    console.error('Failed to get SessionStorage size:', error);
    return 0;
  }
}

export async function getIndexedDBSize(tabId: number): Promise<number> {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: async () => {
        try {
          // 注意：navigator.storage.estimate() 返回的是整个 Origin 的估算值
          // 包含 IndexedDB, CacheStorage, ServiceWorker 注册等
          if (navigator.storage && navigator.storage.estimate) {
            const estimate = await navigator.storage.estimate();
            return estimate.usage || 0;
          }
          return 0;
        } catch {
          return 0;
        }
      },
    });
    return (result?.result as number) || 0;
  } catch (error) {
    console.error('Failed to get IndexedDB size:', error);
    return 0;
  }
}

export async function getCacheStorageSize(tabId: number): Promise<number> {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: async () => {
        try {
          if ('caches' in window) {
            const keys = await caches.keys();
            return keys.length; // 对于 CacheStorage，我们先返回缓存库的数量
          }
          return 0;
        } catch {
          return 0;
        }
      },
    });
    // 由于获取具体字节数较慢，这里返回的是缓存条目的数量标识，UI 上可以特殊处理
    return (result?.result as number) || 0;
  } catch (error) {
    console.error('Failed to get CacheStorage size:', error);
    return 0;
  }
}

export async function getServiceWorkerCount(tabId: number): Promise<number> {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: async () => {
        try {
          if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            return regs.length;
          }
          return 0;
        } catch {
          return 0;
        }
      },
    });
    return (result?.result as number) || 0;
  } catch (error) {
    console.error('Failed to get ServiceWorker count:', error);
    return 0;
  }
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`; // 处理小于 1KB 的情况
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function clearCookies(url: string): Promise<StorageCleanResult> {
  try {
    const cookies = await chrome.cookies.getAll({ url });
    for (const cookie of cookies) {
      const protocol = cookie.secure ? 'https:' : 'http:';
      const cookieUrl = `${protocol}//${cookie.domain}${cookie.path}`;
      await chrome.cookies.remove({
        url: cookieUrl,
        name: cookie.name,
        storeId: cookie.storeId,
      });
    }
    return { success: true, count: cookies.length };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function injectClearLocalStorage(tabId: number): Promise<StorageCleanResult> {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const count = localStorage.length;
        localStorage.clear();
        return { count };
      },
    });
    if (result?.result && typeof result.result === 'object' && 'count' in result.result) {
      return { success: true, count: result.result.count };
    }
    return { success: false, error: 'No result returned' };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function injectClearSessionStorage(tabId: number): Promise<StorageCleanResult> {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const count = sessionStorage.length;
        sessionStorage.clear();
        return { count };
      },
    });
    if (result?.result && typeof result.result === 'object' && 'count' in result.result) {
      return { success: true, count: result.result.count };
    }
    return { success: false, error: 'No result returned' };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function injectClearIndexedDB(tabId: number): Promise<StorageCleanResult> {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: async () => {
        if (typeof indexedDB.databases === 'function') {
          const databases = await indexedDB.databases();
          let count = 0;
          for (const db of databases) {
            if (db.name) {
              const dbName = db.name as string;
              try {
                await new Promise<void>((resolve, reject) => {
                  const deleteReq = indexedDB.deleteDatabase(dbName);
                  const timeout = setTimeout(() => {
                    console.warn('IndexedDB delete timeout:', dbName);
                    resolve(); // Timeout, move to next
                  }, 5000);

                  deleteReq.onblocked = () => {
                    console.warn('IndexedDB delete blocked:', dbName);
                    clearTimeout(timeout);
                    resolve(); // Blocked, move to next
                  };
                  deleteReq.onsuccess = () => {
                    clearTimeout(timeout);
                    resolve();
                  };
                  deleteReq.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error(`Failed to delete ${dbName}`));
                  };
                });
                count++;
              } catch (e) {
                console.error('Delete DB error:', e);
              }
            }
          }
          return { count };
        }
        return { error: 'databases_api_unavailable' };
      },
    });
    if (result?.result && typeof result.result === 'object') {
      if ('error' in result.result) {
        return { success: false, error: String(result.result.error) };
      }
      if ('count' in result.result) {
        return { success: true, count: result.result.count };
      }
    }
    return { success: false, error: 'No result returned' };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function injectClearCacheStorage(tabId: number): Promise<StorageCleanResult> {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: async () => {
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          for (const name of cacheNames) {
            await caches.delete(name);
          }
          return { count: cacheNames.length };
        }
        return { count: 0 };
      },
    });
    if (result?.result && typeof result.result === 'object' && 'count' in result.result) {
      return { success: true, count: result.result.count };
    }
    return { success: false, error: 'No result returned' };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function injectUnregisterServiceWorkers(tabId: number): Promise<StorageCleanResult> {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: async () => {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }
          return { count: registrations.length };
        }
        return { count: 0 };
      },
    });
    if (result?.result && typeof result.result === 'object' && 'count' in result.result) {
      return { success: true, count: result.result.count };
    }
    return { success: false, error: 'No result returned' };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function clearStorage(
  tabId: number,
  url: string,
  options: StorageCleanerOptions,
): Promise<CleaningResult> {
  const result: CleaningResult = { success: true };

  if (options.localStorage) {
    result.localStorage = await injectClearLocalStorage(tabId);
  }

  if (options.sessionStorage) {
    result.sessionStorage = await injectClearSessionStorage(tabId);
  }

  if (options.indexedDB) {
    result.indexedDB = await injectClearIndexedDB(tabId);
  }

  if (options.cookies) {
    result.cookies = await clearCookies(url);
  }

  if (options.cacheStorage) {
    result.cacheStorage = await injectClearCacheStorage(tabId);
  }

  if (options.serviceWorkers) {
    result.serviceWorkers = await injectUnregisterServiceWorkers(tabId);
  }

  // Check if any operation failed
  const failures = Object.values(result).filter(
    (r): r is StorageCleanResult => r?.success === false,
  );

  if (failures.length > 0) {
    result.success = false;
  }

  return result;
}

export function formatCleaningResult(
  result: CleaningResult,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  const parts: string[] = [];

  const optionKeys: (keyof StorageCleanerOptions)[] = [
    'localStorage',
    'sessionStorage',
    'indexedDB',
    'cookies',
    'cacheStorage',
    'serviceWorkers',
  ];

  for (const key of optionKeys) {
    const r = result[key];
    if (r?.success && r.count > 0) {
      parts.push(`${r.count} ${t(`storageCleaner:options.${key}`)}`);
    }
  }

  if (parts.length === 0) {
    return t('storageCleaner:noDataToClean');
  }

  return t('storageCleaner:cleanedSummary', { items: parts.join(', ') });
}

export function isEmptyResult(result: CleaningResult): boolean {
  const values = Object.values(result).filter(
    (r): r is StorageCleanResult => r?.success === true && r.count > 0,
  );
  return values.length === 0;
}
