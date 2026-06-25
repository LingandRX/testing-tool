import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearAllIndexedDBs,
  INDEXED_DB_CLEAR_STORE_TIMEOUT_MS,
  INDEXED_DB_DELETE_FALLBACK_DELAY_MS,
  INDEXED_DB_DELETE_TIMEOUT_MS,
} from '@/utils/indexedDbCleaner';

type DeleteDatabaseBehavior = 'success' | 'blocked' | 'timeout' | 'error';
type ClearStoreBehavior = 'success' | 'hang';

function createDeleteDatabaseMock(behavior: DeleteDatabaseBehavior) {
  return vi.fn(() => {
    const request = {} as IDBOpenDBRequest;
    if (behavior === 'timeout') {
      return request;
    }
    queueMicrotask(() => {
      if (behavior === 'blocked') {
        request.onblocked?.({} as IDBVersionChangeEvent);
      } else if (behavior === 'success') {
        request.onsuccess?.({} as Event);
      } else if (behavior === 'error') {
        request.onerror?.({} as Event);
      }
    });
    return request;
  });
}

function createDeleteDatabaseMockWithLateSuccess(lateAfterMs: number) {
  return vi.fn(() => {
    const request = {} as IDBOpenDBRequest;
    setTimeout(() => {
      request.onsuccess?.({} as Event);
    }, lateAfterMs);
    return request;
  });
}

function createOpenMock(options: {
  storeNames: string[];
  onClearStore?: () => void;
  onTransactionComplete?: () => void;
  onDbClose?: () => void;
  clearStoreBehavior?: ClearStoreBehavior;
  deferTransactionComplete?: boolean;
  syncTransactionComplete?: boolean;
  hangOpen?: boolean;
}) {
  const {
    storeNames,
    onClearStore,
    onTransactionComplete,
    onDbClose,
    clearStoreBehavior = 'success',
    deferTransactionComplete = false,
    syncTransactionComplete = false,
    hangOpen = false,
  } = options;

  return vi.fn(() => {
    const request = {} as IDBOpenDBRequest;
    if (hangOpen) {
      return request;
    }
    const db = {
      objectStoreNames: storeNames,
      transaction: vi.fn(() => {
        const tx = {
          oncomplete: null as ((event: Event) => void) | null,
          onerror: null as ((event: Event) => void) | null,
          onabort: null as ((event: Event) => void) | null,
          abort: vi.fn(),
          objectStore: vi.fn(() => ({
            clear: () => {
              const clearRequest = {} as IDBRequest<void>;
              onClearStore?.();
              if (clearStoreBehavior === 'success') {
                queueMicrotask(() => {
                  clearRequest.onsuccess?.({} as Event);
                  if (syncTransactionComplete) {
                    onTransactionComplete?.();
                    tx.oncomplete?.({} as Event);
                    return;
                  }
                  if (deferTransactionComplete) {
                    return;
                  }
                  setTimeout(() => {
                    onTransactionComplete?.();
                    tx.oncomplete?.({} as Event);
                  }, 0);
                });
              }
              return clearRequest;
            },
          })),
        };
        return tx;
      }),
      close: vi.fn(() => {
        onDbClose?.();
      }),
    };
    queueMicrotask(() => {
      Object.defineProperty(request, 'result', { value: db });
      request.onsuccess?.({} as Event);
    });
    return request;
  });
}

type DeleteBehaviorConfig = DeleteDatabaseBehavior | Record<string, DeleteDatabaseBehavior>;

function createIndexedDBMock(options: {
  databases: Array<{ name: string }>;
  deleteBehavior: DeleteBehaviorConfig;
  open?: ReturnType<typeof createOpenMock>;
}) {
  const resolveDeleteBehavior = (dbName: string): DeleteDatabaseBehavior => {
    if (typeof options.deleteBehavior === 'string') {
      return options.deleteBehavior;
    }
    return options.deleteBehavior[dbName] ?? 'success';
  };

  return {
    databases: vi.fn().mockResolvedValue(options.databases),
    deleteDatabase: vi.fn((dbName: string) =>
      createDeleteDatabaseMock(resolveDeleteBehavior(dbName))(),
    ),
    ...(options.open ? { open: options.open } : {}),
  };
}

async function withIndexedDBMock<T>(indexedDBMock: object, run: () => Promise<T>): Promise<T> {
  const originalIndexedDB = globalThis.indexedDB;
  Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: indexedDBMock });
  try {
    return await run();
  } finally {
    Object.defineProperty(globalThis, 'indexedDB', {
      configurable: true,
      value: originalIndexedDB,
    });
  }
}

describe('indexedDbCleaner', () => {
  const runClear = () =>
    clearAllIndexedDBs(
      INDEXED_DB_DELETE_TIMEOUT_MS,
      INDEXED_DB_CLEAR_STORE_TIMEOUT_MS,
      INDEXED_DB_DELETE_FALLBACK_DELAY_MS,
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should delete IndexedDB successfully when deleteDatabase completes', async () => {
    const indexedDBMock = createIndexedDBMock({
      databases: [{ name: 'app-db' }],
      deleteBehavior: 'success',
    });

    const result = await withIndexedDBMock(indexedDBMock, () =>
      clearAllIndexedDBs(
        INDEXED_DB_DELETE_TIMEOUT_MS,
        INDEXED_DB_CLEAR_STORE_TIMEOUT_MS,
        INDEXED_DB_DELETE_FALLBACK_DELAY_MS,
      ),
    );

    expect(result).toEqual({ count: 1, errors: [] });
    expect(indexedDBMock.deleteDatabase).toHaveBeenCalledWith('app-db');
  });

  it('should report IndexedDB blocked deletions with a user-facing hint', async () => {
    const indexedDBMock = createIndexedDBMock({
      databases: [{ name: 'blocked-db' }],
      deleteBehavior: 'blocked',
    });

    const result = await withIndexedDBMock(indexedDBMock, () =>
      clearAllIndexedDBs(
        INDEXED_DB_DELETE_TIMEOUT_MS,
        INDEXED_DB_CLEAR_STORE_TIMEOUT_MS,
        INDEXED_DB_DELETE_FALLBACK_DELAY_MS,
      ),
    );

    expect(result).toEqual({
      count: 0,
      errors: ['页面仍占用 IndexedDB（blocked-db），请刷新后重试或关闭占用该页面的连接'],
    });
    expect(indexedDBMock.deleteDatabase).toHaveBeenCalledWith('blocked-db');
  });

  it('should clear object stores when IndexedDB deletion is blocked', async () => {
    const clearStore = vi.fn();
    const indexedDBMock = createIndexedDBMock({
      databases: [{ name: 'ImageCacheDB' }],
      deleteBehavior: 'blocked',
      open: createOpenMock({ storeNames: ['images'], onClearStore: clearStore }),
    });

    const result = await withIndexedDBMock(indexedDBMock, runClear);

    expect(result).toEqual({ count: 1, errors: [] });
    expect(clearStore).toHaveBeenCalledTimes(1);
    expect(indexedDBMock.deleteDatabase).not.toHaveBeenCalled();
  });

  it('should clear object stores when IndexedDB deletion times out', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const clearStore = vi.fn();
    const openMock = createOpenMock({ storeNames: ['images'], onClearStore: clearStore });
    const hangOpenRequest = {} as IDBOpenDBRequest;
    openMock.mockImplementationOnce(() => hangOpenRequest);
    const indexedDBMock = createIndexedDBMock({
      databases: [{ name: 'ImageCacheDB' }],
      deleteBehavior: 'timeout',
      open: openMock,
    });

    const result = await withIndexedDBMock(indexedDBMock, async () => {
      const resultPromise = runClear();
      await vi.advanceTimersByTimeAsync(
        INDEXED_DB_CLEAR_STORE_TIMEOUT_MS +
          INDEXED_DB_DELETE_TIMEOUT_MS +
          INDEXED_DB_DELETE_FALLBACK_DELAY_MS,
      );
      await vi.runOnlyPendingTimersAsync();
      return resultPromise;
    });

    expect(result).toEqual({ count: 1, errors: [] });
    expect(clearStore).toHaveBeenCalledTimes(1);
  });

  it('should wait for transaction complete before closing db', async () => {
    const events: string[] = [];
    const indexedDBMock = createIndexedDBMock({
      databases: [{ name: 'ImageCacheDB' }],
      deleteBehavior: 'blocked',
      open: createOpenMock({
        storeNames: ['images'],
        onTransactionComplete: () => events.push('transaction-complete'),
        onDbClose: () => events.push('db-close'),
      }),
    });

    await withIndexedDBMock(indexedDBMock, runClear);

    expect(events).toEqual(['transaction-complete', 'db-close']);
  });

  it('should not hang when transaction completes before clear promises settle', async () => {
    const indexedDBMock = createIndexedDBMock({
      databases: [{ name: 'ImageCacheDB' }],
      deleteBehavior: 'blocked',
      open: createOpenMock({
        storeNames: ['images'],
        syncTransactionComplete: true,
      }),
    });

    const result = await withIndexedDBMock(indexedDBMock, runClear);

    expect(result).toEqual({ count: 1, errors: [] });
  });

  it('should timeout when opening IndexedDB for fallback never completes', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const indexedDBMock = createIndexedDBMock({
      databases: [{ name: 'ImageCacheDB' }],
      deleteBehavior: 'blocked',
      open: createOpenMock({ storeNames: ['images'], hangOpen: true }),
    });

    const resultPromise = withIndexedDBMock(indexedDBMock, runClear);
    await vi.advanceTimersByTimeAsync(
      INDEXED_DB_CLEAR_STORE_TIMEOUT_MS +
        INDEXED_DB_DELETE_FALLBACK_DELAY_MS +
        INDEXED_DB_CLEAR_STORE_TIMEOUT_MS,
    );
    const result = await resultPromise;

    expect(result).toEqual({
      count: 0,
      errors: ['无法打开 IndexedDB（ImageCacheDB）进行清空，请刷新后重试'],
    });
  });

  it('should ignore late onsuccess after delete timeout', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const clearStore = vi.fn();
    const openMock = createOpenMock({ storeNames: ['images'], onClearStore: clearStore });
    const hangOpenRequest = {} as IDBOpenDBRequest;
    openMock.mockImplementationOnce(() => hangOpenRequest);
    const indexedDBMock = {
      databases: vi.fn().mockResolvedValue([{ name: 'ImageCacheDB' }]),
      deleteDatabase: createDeleteDatabaseMockWithLateSuccess(INDEXED_DB_DELETE_TIMEOUT_MS + 1000),
      open: openMock,
    };

    const result = await withIndexedDBMock(indexedDBMock, async () => {
      const resultPromise = runClear();
      await vi.advanceTimersByTimeAsync(
        INDEXED_DB_CLEAR_STORE_TIMEOUT_MS +
          INDEXED_DB_DELETE_TIMEOUT_MS +
          INDEXED_DB_DELETE_FALLBACK_DELAY_MS,
      );
      await vi.runOnlyPendingTimersAsync();
      return resultPromise;
    });

    expect(result).toEqual({ count: 1, errors: [] });
    expect(clearStore).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1000);
    expect(result).toEqual({ count: 1, errors: [] });
  });

  it('should report the store name when fallback clearing times out', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const openMock = createOpenMock({ storeNames: ['images'], clearStoreBehavior: 'hang' });
    const hangOpenRequest = {} as IDBOpenDBRequest;
    openMock.mockImplementationOnce(() => hangOpenRequest);
    const indexedDBMock = createIndexedDBMock({
      databases: [{ name: 'ImageCacheDB' }],
      deleteBehavior: 'blocked',
      open: openMock,
    });

    const result = await withIndexedDBMock(indexedDBMock, async () => {
      const resultPromise = runClear();
      await vi.advanceTimersByTimeAsync(
        INDEXED_DB_CLEAR_STORE_TIMEOUT_MS +
          INDEXED_DB_DELETE_FALLBACK_DELAY_MS +
          INDEXED_DB_CLEAR_STORE_TIMEOUT_MS,
      );
      return resultPromise;
    });

    expect(result).toEqual({
      count: 0,
      errors: ['清空 IndexedDB 超时（ImageCacheDB/images），请刷新后重试'],
    });
  });

  it('should delete all IndexedDB databases when every delete succeeds', async () => {
    const indexedDBMock = createIndexedDBMock({
      databases: [{ name: 'db-a' }, { name: 'db-b' }, { name: 'db-c' }],
      deleteBehavior: 'success',
    });

    const result = await withIndexedDBMock(indexedDBMock, () =>
      clearAllIndexedDBs(
        INDEXED_DB_DELETE_TIMEOUT_MS,
        INDEXED_DB_CLEAR_STORE_TIMEOUT_MS,
        INDEXED_DB_DELETE_FALLBACK_DELAY_MS,
      ),
    );

    expect(result).toEqual({ count: 3, errors: [] });
    expect(indexedDBMock.deleteDatabase).toHaveBeenCalledTimes(3);
  });

  it('should succeed when some deletions fallback to clear object stores', async () => {
    const clearStore = vi.fn();
    const indexedDBMock = createIndexedDBMock({
      databases: [{ name: 'db-a' }, { name: 'db-b' }, { name: 'db-c' }],
      deleteBehavior: { 'db-a': 'success', 'db-b': 'success', 'db-c': 'blocked' },
      open: createOpenMock({ storeNames: ['data'], onClearStore: clearStore }),
    });

    const result = await withIndexedDBMock(indexedDBMock, () =>
      clearAllIndexedDBs(
        INDEXED_DB_DELETE_TIMEOUT_MS,
        INDEXED_DB_CLEAR_STORE_TIMEOUT_MS,
        INDEXED_DB_DELETE_FALLBACK_DELAY_MS,
      ),
    );

    expect(result).toEqual({ count: 3, errors: [] });
    expect(clearStore).toHaveBeenCalledTimes(3);
    expect(indexedDBMock.deleteDatabase).not.toHaveBeenCalled();
  });

  it('should preserve partial count when some IndexedDB databases fail', async () => {
    const indexedDBMock = createIndexedDBMock({
      databases: [{ name: 'db-a' }, { name: 'db-b' }, { name: 'db-c' }],
      deleteBehavior: { 'db-a': 'success', 'db-b': 'success', 'db-c': 'error' },
    });

    const result = await withIndexedDBMock(indexedDBMock, () =>
      clearAllIndexedDBs(
        INDEXED_DB_DELETE_TIMEOUT_MS,
        INDEXED_DB_CLEAR_STORE_TIMEOUT_MS,
        INDEXED_DB_DELETE_FALLBACK_DELAY_MS,
      ),
    );

    expect(result).toEqual({
      count: 2,
      errors: ['删除 IndexedDB 失败（db-c），请刷新后重试'],
    });
  });

  it('should preserve partial count when blocked fallback fails for one database', async () => {
    const indexedDBMock = createIndexedDBMock({
      databases: [{ name: 'db-a' }, { name: 'db-b' }, { name: 'blocked-db' }],
      deleteBehavior: { 'db-a': 'success', 'db-b': 'success', 'blocked-db': 'blocked' },
    });

    const result = await withIndexedDBMock(indexedDBMock, () =>
      clearAllIndexedDBs(
        INDEXED_DB_DELETE_TIMEOUT_MS,
        INDEXED_DB_CLEAR_STORE_TIMEOUT_MS,
        INDEXED_DB_DELETE_FALLBACK_DELAY_MS,
      ),
    );

    expect(result).toEqual({
      count: 2,
      errors: ['页面仍占用 IndexedDB（blocked-db），请刷新后重试或关闭占用该页面的连接'],
    });
  });

  it('should clear ImageCacheDB on consecutive attempts without calling delete first', async () => {
    const clearStore = vi.fn();
    const openMock = createOpenMock({ storeNames: ['images'], onClearStore: clearStore });
    const indexedDBMock = createIndexedDBMock({
      databases: [{ name: 'ImageCacheDB' }],
      deleteBehavior: 'blocked',
      open: openMock,
    });

    await withIndexedDBMock(indexedDBMock, runClear);
    const secondResult = await withIndexedDBMock(indexedDBMock, runClear);

    expect(secondResult).toEqual({ count: 1, errors: [] });
    expect(clearStore).toHaveBeenCalledTimes(2);
    expect(indexedDBMock.deleteDatabase).not.toHaveBeenCalled();
  });

  it('should run when deserialized into page context with explicit timeout args', async () => {
    const indexedDBMock = createIndexedDBMock({
      databases: [],
      deleteBehavior: 'success',
    });

    const result = await withIndexedDBMock(indexedDBMock, async () => {
      const injected = (0, eval)(`(${clearAllIndexedDBs.toString()})`) as typeof clearAllIndexedDBs;
      return injected(
        INDEXED_DB_DELETE_TIMEOUT_MS,
        INDEXED_DB_CLEAR_STORE_TIMEOUT_MS,
        INDEXED_DB_DELETE_FALLBACK_DELAY_MS,
      );
    });

    expect(result).toEqual({ count: 0, errors: [] });
  });

  it('should return count 0 when no IndexedDB databases exist', async () => {
    const indexedDBMock = createIndexedDBMock({
      databases: [],
      deleteBehavior: 'success',
    });

    const result = await withIndexedDBMock(indexedDBMock, () =>
      clearAllIndexedDBs(
        INDEXED_DB_DELETE_TIMEOUT_MS,
        INDEXED_DB_CLEAR_STORE_TIMEOUT_MS,
        INDEXED_DB_DELETE_FALLBACK_DELAY_MS,
      ),
    );

    expect(result).toEqual({ count: 0, errors: [] });
    expect(indexedDBMock.deleteDatabase).not.toHaveBeenCalled();
  });
});
