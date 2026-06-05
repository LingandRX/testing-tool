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

/** 清理选项的 key 列表（用于遍历结果） */
const CLEAN_OPTION_KEYS: (keyof StorageCleanerOptions)[] = [
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'cookies',
  'cacheStorage',
  'serviceWorkers',
];

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
    const encoder = new TextEncoder();
    // 估算：名称 + 值 + 域名 + 路径 的 UTF-8 字节数
    return cookies.reduce(
      (acc, c) =>
        acc +
        encoder.encode(c.name).length +
        encoder.encode(c.value).length +
        encoder.encode(c.domain ?? '').length +
        encoder.encode(c.path ?? '').length,
      0,
    );
  } catch (error) {
    console.error('Failed to get cookie size:', error);
    return 0;
  }
}

/**
 * 通用辅助：在指定标签页中执行脚本并返回结果
 *
 * @param tabId 标签页 ID
 * @param func 在页面上下文中执行的函数
 * @param errorLabel 错误日志前缀
 * @param fallback 执行失败时的回退值
 */
async function runScript<T>(
  tabId: number,
  func: () => T | Promise<T>,
  errorLabel: string,
  fallback: T,
): Promise<T> {
  try {
    const [result] = await chrome.scripting.executeScript({ target: { tabId }, func });
    return (result?.result as T) ?? fallback;
  } catch (error) {
    console.error(`Failed to ${errorLabel}:`, error);
    return fallback;
  }
}

export async function getLocalStorageSize(tabId: number): Promise<number> {
  return runScript(
    tabId,
    () => {
      try {
        const encoder = new TextEncoder();
        return Object.entries(localStorage).reduce(
          (acc, [k, v]) => acc + encoder.encode(k).length + encoder.encode(v).length,
          0,
        );
      } catch {
        return 0;
      }
    },
    'get LocalStorage size',
    0,
  );
}

export async function getSessionStorageSize(tabId: number): Promise<number> {
  return runScript(
    tabId,
    () => {
      try {
        const encoder = new TextEncoder();
        return Object.entries(sessionStorage).reduce(
          (acc, [k, v]) => acc + encoder.encode(k).length + encoder.encode(v).length,
          0,
        );
      } catch {
        return 0;
      }
    },
    'get SessionStorage size',
    0,
  );
}

export async function getOriginStorageEstimate(tabId: number): Promise<number> {
  return runScript(
    tabId,
    async () => {
      try {
        if (navigator.storage && navigator.storage.estimate) {
          const estimate = await navigator.storage.estimate();
          return estimate.usage || 0;
        }
        return 0;
      } catch {
        return 0;
      }
    },
    'get origin storage estimate',
    0,
  );
}

export async function getCacheStorageSize(tabId: number): Promise<number> {
  return runScript(
    tabId,
    async () => {
      try {
        if ('caches' in window) {
          const keys = await caches.keys();
          return keys.length;
        }
        return 0;
      } catch {
        return 0;
      }
    },
    'get CacheStorage size',
    0,
  );
}

export async function getServiceWorkerCount(tabId: number): Promise<number> {
  return runScript(
    tabId,
    async () => {
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
    'get ServiceWorker count',
    0,
  );
}

export async function clearCookies(url: string): Promise<StorageCleanResult> {
  try {
    const cookies = await chrome.cookies.getAll({ url });
    for (const cookie of cookies) {
      const protocol = cookie.secure ? 'https:' : 'http:';
      const domain = cookie.domain.startsWith('.') ? cookie.domain.slice(1) : cookie.domain;
      const cookieUrl = `${protocol}//${domain}${cookie.path}`;
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

/**
 * 通用辅助：执行清理脚本并解析结果
 *
 * @param tabId 标签页 ID
 * @param func 在页面上下文中执行的清理函数
 * @param errorLabel 错误日志前缀
 */
async function runCleanScript(
  tabId: number,
  func: () => { count: number } | Promise<{ count: number }>,
  errorLabel: string,
): Promise<StorageCleanResult> {
  const raw = await runScript(tabId, func, errorLabel, { count: 0 });
  if (raw && typeof raw === 'object' && 'count' in raw) {
    return { success: true, count: raw.count };
  }
  return { success: false, error: 'No result returned' };
}

async function injectClearLocalStorage(tabId: number): Promise<StorageCleanResult> {
  return runCleanScript(
    tabId,
    () => {
      const count = localStorage.length;
      localStorage.clear();
      return { count };
    },
    'clear LocalStorage',
  );
}

async function injectClearSessionStorage(tabId: number): Promise<StorageCleanResult> {
  return runCleanScript(
    tabId,
    () => {
      const count = sessionStorage.length;
      sessionStorage.clear();
      return { count };
    },
    'clear SessionStorage',
  );
}

async function injectClearIndexedDB(tabId: number): Promise<StorageCleanResult> {
  return runCleanScript(
    tabId,
    async () => {
      if (typeof indexedDB.databases !== 'function') {
        return { count: 0 };
      }
      const databases = await indexedDB.databases();
      let count = 0;
      for (const db of databases) {
        if (!db.name) continue;
        const dbName = db.name;
        try {
          await new Promise<void>((resolve, reject) => {
            const deleteReq = indexedDB.deleteDatabase(dbName);
            const timeout = setTimeout(() => {
              console.warn('IndexedDB delete timeout:', dbName);
              resolve();
            }, 5000);
            deleteReq.onblocked = () => {
              console.warn('IndexedDB delete blocked:', dbName);
              clearTimeout(timeout);
              resolve();
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
      return { count };
    },
    'clear IndexedDB',
  );
}

async function injectClearCacheStorage(tabId: number): Promise<StorageCleanResult> {
  return runCleanScript(
    tabId,
    async () => {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
        }
        return { count: cacheNames.length };
      }
      return { count: 0 };
    },
    'clear CacheStorage',
  );
}

async function injectUnregisterServiceWorkers(tabId: number): Promise<StorageCleanResult> {
  return runCleanScript(
    tabId,
    async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
        return { count: registrations.length };
      }
      return { count: 0 };
    },
    'unregister ServiceWorkers',
  );
}

export async function clearStorage(
  tabId: number,
  url: string,
  options: StorageCleanerOptions,
): Promise<CleaningResult> {
  const result: CleaningResult = { overallSuccess: true };

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

  const failures = Object.values(result).filter(
    (r): r is StorageCleanResult => r?.success === false,
  );
  if (failures.length > 0) {
    result.overallSuccess = false;
  }

  return result;
}

export function formatCleaningResult(
  result: CleaningResult,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  const parts: string[] = [];

  for (const key of CLEAN_OPTION_KEYS) {
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
