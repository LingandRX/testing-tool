import type { StorageCleanerOptions, CleaningResult, StorageCleanResult } from '@/types/storage';

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
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

export function isRestrictedUrl(url?: string): boolean {
  if (!url) return true;
  return RESTRICTED_PROTOCOLS.some((p) => url.startsWith(p));
}

export async function clearCookies(url: string): Promise<StorageCleanResult> {
  try {
    const cookies = await chrome.cookies.getAll({ url });
    for (const cookie of cookies) {
      await chrome.cookies.remove({
        url,
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
              await new Promise<void>((resolve, reject) => {
                const deleteReq = indexedDB.deleteDatabase(dbName);
                deleteReq.onblocked = () => {
                  console.warn('IndexedDB delete blocked:', dbName);
                };
                deleteReq.onsuccess = () => resolve();
                deleteReq.onerror = () => reject();
              });
              count++;
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

export async function injectUnregisterServiceWorkers(
  tabId: number,
): Promise<StorageCleanResult> {
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
    result.error = '部分清理失败';
  }

  return result;
}

export function formatCleaningResult(result: CleaningResult): string {
  const parts: string[] = [];

  if (result.localStorage?.success) {
    parts.push(`${result.localStorage.count} 个 localStorage`);
  }
  if (result.sessionStorage?.success) {
    parts.push(`${result.sessionStorage.count} 个 sessionStorage`);
  }
  if (result.indexedDB?.success) {
    parts.push(`${result.indexedDB.count} 个 IndexedDB`);
  }
  if (result.cookies?.success) {
    parts.push(`${result.cookies.count} 个 Cookies`);
  }
  if (result.cacheStorage?.success) {
    parts.push(`${result.cacheStorage.count} 个 Cache`);
  }
  if (result.serviceWorkers?.success) {
    parts.push(`${result.serviceWorkers.count} 个 Service Workers`);
  }

  if (parts.length === 0) {
    return '该页面没有可清理的存储数据';
  }

  return `清理了 ${parts.join(', ')}`;
}

export function isEmptyResult(result: CleaningResult): boolean {
  const values = Object.values(result).filter(
    (r): r is StorageCleanResult => r?.success === true && r.count > 0,
  );
  return values.length === 0;
}
