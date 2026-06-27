import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearAllIndexedDBs,
  INDEXED_DB_CLEAR_STORE_TIMEOUT_MS,
  INDEXED_DB_DELETE_FALLBACK_DELAY_MS,
  INDEXED_DB_DELETE_TIMEOUT_MS,
} from '@/utils/indexedDbCleaner';
import { clearCookies, clearStorage } from '@/utils/storageCleaner';
import type { StorageCleanerOptions } from '@/types/storage';

const indexedDBClearOptions: StorageCleanerOptions = {
  localStorage: false,
  sessionStorage: false,
  indexedDB: true,
  cookies: false,
  cacheStorage: false,
  serviceWorkers: false,
};

function mockExecuteScriptEval() {
  (chrome.scripting.executeScript as any).mockImplementationOnce(
    async ({ func, args }: { func: (...a: unknown[]) => unknown; args?: unknown[] }) => {
      if (func === clearAllIndexedDBs) {
        const deleteTimeoutMs = (args?.[0] as number | undefined) ?? INDEXED_DB_DELETE_TIMEOUT_MS;
        const clearStoreTimeoutMs =
          (args?.[1] as number | undefined) ?? INDEXED_DB_CLEAR_STORE_TIMEOUT_MS;
        const fallbackDelayMs =
          (args?.[2] as number | undefined) ?? INDEXED_DB_DELETE_FALLBACK_DELAY_MS;
        return [
          {
            result: await clearAllIndexedDBs(deleteTimeoutMs, clearStoreTimeoutMs, fallbackDelayMs),
          },
        ];
      }
      const isolatedFunc = (0, eval)(`(${func.toString()})`) as (
        ...a: unknown[]
      ) => Promise<unknown>;
      return [{ result: await isolatedFunc(...(args ?? [])) }];
    },
  );
}

function mockIndexedDBForEmptyDatabases() {
  Object.defineProperty(globalThis, 'indexedDB', {
    configurable: true,
    value: {
      databases: vi.fn().mockResolvedValue([]),
    },
  });
}

describe('storageCleaner utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('clearCookies', () => {
    it('should strip leading dot from cookie domain when removing cookies', async () => {
      const mockCookies = [
        { name: 'session', domain: '.example.com', path: '/', secure: true, storeId: '0' },
        { name: 'auth', domain: '.example.com', path: '/api', secure: false, storeId: '0' },
      ];
      (chrome.cookies.getAll as any).mockResolvedValue(mockCookies);
      (chrome.cookies.remove as any).mockResolvedValue(undefined);

      const result = await clearCookies('https://example.com');

      expect(result).toEqual({ success: true, count: 2 });
      expect(chrome.cookies.remove).toHaveBeenCalledWith({
        url: 'https://example.com/',
        name: 'session',
        storeId: '0',
      });
      expect(chrome.cookies.remove).toHaveBeenCalledWith({
        url: 'http://example.com/api',
        name: 'auth',
        storeId: '0',
      });
    });

    it('should handle domains without leading dot', async () => {
      const mockCookies = [
        { name: 'pref', domain: 'sub.example.com', path: '/path', secure: true, storeId: '0' },
      ];
      (chrome.cookies.getAll as any).mockResolvedValue(mockCookies);
      (chrome.cookies.remove as any).mockResolvedValue(undefined);

      const result = await clearCookies('https://sub.example.com');

      expect(result).toEqual({ success: true, count: 1 });
      expect(chrome.cookies.remove).toHaveBeenCalledWith({
        url: 'https://sub.example.com/path',
        name: 'pref',
        storeId: '0',
      });
    });

    it('should return error when operation fails', async () => {
      (chrome.cookies.getAll as any).mockRejectedValue(new Error('Permission denied'));

      const result = await clearCookies('https://example.com');

      expect(result).toEqual({ success: false, error: 'Error: Permission denied' });
    });
  });

  describe('clearStorage', () => {
    it('should report script injection failures instead of treating fallback values as success', async () => {
      (chrome.scripting.executeScript as any).mockRejectedValueOnce(
        new Error('Cannot access this page'),
      );

      const result = await clearStorage(1, 'https://example.com', {
        localStorage: true,
        sessionStorage: false,
        indexedDB: false,
        cookies: false,
        cacheStorage: false,
        serviceWorkers: false,
      });

      expect(result.overallSuccess).toBe(false);
      expect(result.localStorage).toEqual({
        success: false,
        error: 'Error: Cannot access this page',
      });
    });

    it('should wire IndexedDB cleanup through executeScript with clearAllIndexedDBs', async () => {
      mockIndexedDBForEmptyDatabases();
      mockExecuteScriptEval();

      const result = await clearStorage(1, 'https://example.com', indexedDBClearOptions);

      expect(chrome.scripting.executeScript).toHaveBeenCalledWith(
        expect.objectContaining({
          func: clearAllIndexedDBs,
          args: [
            INDEXED_DB_DELETE_TIMEOUT_MS,
            INDEXED_DB_CLEAR_STORE_TIMEOUT_MS,
            INDEXED_DB_DELETE_FALLBACK_DELAY_MS,
          ],
        }),
      );
      expect(result.overallSuccess).toBe(true);
      expect(result.indexedDB).toEqual({ success: true, count: 0 });
    });

    it('should aggregate selected storage failures into overallSuccess', async () => {
      (chrome.scripting.executeScript as any).mockResolvedValueOnce([{ result: { count: 1 } }]);
      (chrome.cookies.getAll as any).mockRejectedValueOnce(new Error('Cookie denied'));

      const result = await clearStorage(1, 'https://example.com', {
        localStorage: true,
        sessionStorage: false,
        indexedDB: false,
        cookies: true,
        cacheStorage: false,
        serviceWorkers: false,
      });

      expect(result.overallSuccess).toBe(false);
      expect(result.localStorage).toEqual({ success: true, count: 1 });
      expect(result.cookies).toEqual({ success: false, error: 'Error: Cookie denied' });
      expect(result.error).toBe('Cookies: Error: Cookie denied');
    });

    it('should join multiple storage failure messages in result.error', async () => {
      (chrome.scripting.executeScript as any).mockRejectedValueOnce(new Error('Script denied'));
      (chrome.cookies.getAll as any).mockRejectedValueOnce(new Error('Cookie denied'));

      const result = await clearStorage(1, 'https://example.com', {
        localStorage: true,
        sessionStorage: false,
        indexedDB: false,
        cookies: true,
        cacheStorage: false,
        serviceWorkers: false,
      });

      expect(result.overallSuccess).toBe(false);
      expect(result.localStorage).toEqual({ success: false, error: 'Error: Script denied' });
      expect(result.cookies).toEqual({ success: false, error: 'Error: Cookie denied' });
      expect(result.error).toBe(
        'Local Storage: Error: Script denied\nCookies: Error: Cookie denied',
      );
    });

    it('should preserve partial IndexedDB count when runCleanScript receives errors', async () => {
      (chrome.scripting.executeScript as any).mockImplementationOnce(async () => [
        {
          result: {
            count: 2,
            errors: ['删除 IndexedDB 失败（db-c），请刷新后重试'],
          },
        },
      ]);

      const result = await clearStorage(1, 'https://example.com', indexedDBClearOptions);

      expect(result.overallSuccess).toBe(false);
      expect(result.indexedDB).toEqual({
        success: false,
        count: 2,
        error: '（已成功清理 2 个数据库，但部分失败）\n删除 IndexedDB 失败（db-c），请刷新后重试',
      });
    });
  });
});
