import type { CleaningResult, StorageCleanerOptions, StorageCleanResult } from '@/types/storage';
import { CLEAN_OPTION_KEYS, OPTION_LABELS } from '@/pages/StorageCleaner/constants';
import {
  clearAllIndexedDBs,
  INDEXED_DB_CLEAR_STORE_TIMEOUT_MS,
  INDEXED_DB_DELETE_FALLBACK_DELAY_MS,
  INDEXED_DB_DELETE_TIMEOUT_MS,
  type IndexedDBCleanResult,
} from '@/utils/indexedDbCleaner';
import { browser } from 'wxt/browser';

export async function getCurrentTab() {
  // For popup pages, we need to get the active tab from the browser window that triggered the popup.
  // We should ONLY care about the currently active tab in the last focused window.
  // If it's a restricted URL, we return it anyway and let the caller handle the error display.

  const [tab] = await browser.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });

  if (tab) {
    return tab;
  }

  // Fallback for cases where lastFocusedWindow might not work as expected (e.g. certain sidepanel scenarios)
  const [fallbackTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  return fallbackTab;
}

export async function getCookieSize(url: string): Promise<number> {
  try {
    const cookies = await browser.cookies.getAll({ url });
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

type ExecuteInTabOptions<T> =
  | { errorLabel: string; mode: 'fallback'; fallback: T }
  | { errorLabel: string; mode: 'throw' };

async function executeInTab<T, A extends unknown[] = []>(
  tabId: number,
  func: (...args: A) => T | Promise<T>,
  options: ExecuteInTabOptions<T>,
  args?: A,
): Promise<T> {
  try {
    const [result] = await browser.scripting.executeScript({
      target: { tabId },
      func,
      ...(args ? { args } : {}),
    });
    const value = result?.result as T | undefined;
    if (value !== undefined && value !== null) {
      return value;
    }
    if (options.mode === 'fallback') {
      return options.fallback;
    }
    return undefined as T;
  } catch (error) {
    console.error(`Failed to ${options.errorLabel}:`, error);
    if (options.mode === 'throw') {
      throw error;
    }
    return options.fallback;
  }
}

async function runScript<T, A extends unknown[] = []>(
  tabId: number,
  func: (...args: A) => T | Promise<T>,
  errorLabel: string,
  fallback: T,
  args?: A,
): Promise<T> {
  return executeInTab(tabId, func, { errorLabel, mode: 'fallback', fallback }, args);
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
    const cookies = await browser.cookies.getAll({ url });
    for (const cookie of cookies) {
      const protocol = cookie.secure ? 'https:' : 'http:';
      const domain = cookie.domain.startsWith('.') ? cookie.domain.slice(1) : cookie.domain;
      const cookieUrl = `${protocol}//${domain}${cookie.path}`;
      await browser.cookies.remove({
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
async function runCleanScript<A extends unknown[] = []>(
  tabId: number,
  func: (...args: A) => IndexedDBCleanResult | Promise<IndexedDBCleanResult>,
  errorLabel: string,
  args?: A,
): Promise<StorageCleanResult> {
  try {
    const raw = await executeInTab(tabId, func, { errorLabel, mode: 'throw' }, args);
    if (!raw || typeof raw !== 'object' || !('count' in raw)) {
      return { success: false, error: 'No result returned' };
    }

    if (raw.errors?.length) {
      const errorMsg = raw.errors.join('\n');
      const partialHint = raw.count > 0 ? `（已成功清理 ${raw.count} 个数据库，但部分失败）\n` : '';
      return {
        success: false,
        error: partialHint + errorMsg,
        ...(raw.count > 0 ? { count: raw.count } : {}),
      };
    }

    return { success: true, count: raw.count };
  } catch (error) {
    console.error(`Failed to ${errorLabel}:`, error);
    return { success: false, error: String(error) };
  }
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
  return runCleanScript(tabId, clearAllIndexedDBs, 'clear IndexedDB', [
    INDEXED_DB_DELETE_TIMEOUT_MS,
    INDEXED_DB_CLEAR_STORE_TIMEOUT_MS,
    INDEXED_DB_DELETE_FALLBACK_DELAY_MS,
  ]);
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
    result.error = CLEAN_OPTION_KEYS.flatMap((key) => {
      const itemResult = result[key];
      if (!itemResult || itemResult.success) return [];
      return `${OPTION_LABELS[key]}: ${itemResult.error}`;
    }).join('\n');
  }

  return result;
}

export function formatCleaningResult(result: CleaningResult): string {
  const parts: string[] = [];

  for (const key of CLEAN_OPTION_KEYS) {
    const r = result[key];
    if (r?.success && r.count > 0) {
      parts.push(`${r.count} ${OPTION_LABELS[key] || key}`);
    }
  }

  if (parts.length === 0) {
    return '该页面没有可清理的存储数据';
  }

  return `清理了 ${parts.join(', ')}`;
}
