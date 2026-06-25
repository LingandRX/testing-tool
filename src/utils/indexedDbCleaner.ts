export const INDEXED_DB_DELETE_TIMEOUT_MS = 5000;
export const INDEXED_DB_CLEAR_STORE_TIMEOUT_MS = 5000;
export const INDEXED_DB_DELETE_FALLBACK_DELAY_MS = 200;

export interface IndexedDBCleanResult {
  count: number;
  errors?: string[];
}

/**
 * 在页面上下文中清理当前 origin 的全部 IndexedDB。
 * 设计为可传入 executeScript({ func }) 的自包含函数。
 *
 * 参数必须由调用方显式传入（不可使用模块常量作默认参数），
 * 否则函数序列化到页面后缺省参数求值会 ReferenceError。
 */
export async function clearAllIndexedDBs(
  deleteTimeoutMs: number,
  clearStoreTimeoutMs: number,
  fallbackDelayMs: number,
): Promise<IndexedDBCleanResult> {
  const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

  const waitForTransaction = (tx: IDBTransaction, timeoutMs: number): Promise<void> =>
    new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Transaction timeout'));
      }, timeoutMs);

      tx.oncomplete = () => {
        clearTimeout(timeoutId);
        resolve();
      };
      tx.onerror = () => {
        clearTimeout(timeoutId);
        reject(tx.error ?? new Error('Transaction failed'));
      };
      tx.onabort = () => {
        clearTimeout(timeoutId);
        reject(tx.error ?? new Error('Transaction aborted'));
      };
    });

  const openDatabase = (dbName: string, timeoutMs: number): Promise<IDBDatabase> =>
    new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Open timeout'));
      }, timeoutMs);

      const openReq = indexedDB.open(dbName);
      openReq.onerror = () => {
        clearTimeout(timeoutId);
        reject(openReq.error ?? new Error('Open failed'));
      };
      openReq.onsuccess = () => {
        clearTimeout(timeoutId);
        resolve(openReq.result);
      };
    });

  const waitForDeleteDatabase = (dbName: string, timeoutMs: number) =>
    new Promise<'deleted' | 'blocked' | 'timeout' | 'error'>((resolve) => {
      let settled = false;
      const settle = (status: 'deleted' | 'blocked' | 'timeout' | 'error') => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        resolve(status);
      };

      const deleteReq = indexedDB.deleteDatabase(dbName);
      const timeoutId = setTimeout(() => {
        console.warn('IndexedDB delete timeout:', dbName);
        settle('timeout');
      }, timeoutMs);

      deleteReq.onblocked = () => {
        console.warn('IndexedDB delete blocked:', dbName);
        settle('blocked');
      };
      deleteReq.onsuccess = () => settle('deleted');
      deleteReq.onerror = () => settle('error');
    });

  const formatDeleteError = (dbName: string, status: 'blocked' | 'timeout' | 'error'): string => {
    if (status === 'blocked') {
      return `页面仍占用 IndexedDB（${dbName}），请刷新后重试或关闭占用该页面的连接`;
    }

    if (status === 'timeout') {
      return `删除 IndexedDB 超时（${dbName}），请刷新后重试`;
    }

    return `删除 IndexedDB 失败（${dbName}），请刷新后重试`;
  };

  const clearObjectStores = async (
    dbName: string,
  ): Promise<{ success: boolean; errors: string[] }> => {
    if (typeof indexedDB.open !== 'function') {
      return { success: false, errors: [] };
    }

    const clearStore = (store: IDBObjectStore, storeName: string): Promise<string | null> =>
      new Promise((resolve) => {
        const timeoutId = setTimeout(() => {
          resolve(`清空 IndexedDB 超时（${dbName}/${storeName}），请刷新后重试`);
        }, clearStoreTimeoutMs);

        const clearReq = store.clear();
        clearReq.onsuccess = () => {
          clearTimeout(timeoutId);
          resolve(null);
        };
        clearReq.onerror = () => {
          clearTimeout(timeoutId);
          resolve(`清空 IndexedDB 失败（${dbName}/${storeName}），请刷新后重试`);
        };
      });

    let db: IDBDatabase | undefined;
    try {
      db = await openDatabase(dbName, clearStoreTimeoutMs);
    } catch {
      return {
        success: false,
        errors: [`无法打开 IndexedDB（${dbName}）进行清空，请刷新后重试`],
      };
    }

    try {
      const storeNames = Array.from(db.objectStoreNames);
      if (storeNames.length === 0) {
        return { success: true, errors: [] };
      }

      const transaction = db.transaction(storeNames, 'readwrite');
      // 必须在 clear 请求完成前注册 oncomplete，否则事务可能已结束导致永久挂起
      const transactionDone = waitForTransaction(transaction, clearStoreTimeoutMs);
      void transactionDone.catch(() => undefined);
      const errors = (
        await Promise.all(
          storeNames.map((storeName) => clearStore(transaction.objectStore(storeName), storeName)),
        )
      ).filter((error): error is string => Boolean(error));

      if (errors.length > 0) {
        try {
          transaction.abort();
        } catch {
          // ignore abort failures on already-finished transactions
        }
        return { success: false, errors };
      }

      try {
        await transactionDone;
      } catch {
        return {
          success: false,
          errors: [`清空 IndexedDB 失败（${dbName}），请刷新后重试`],
        };
      }

      return { success: true, errors: [] };
    } catch {
      return {
        success: false,
        errors: [`清空 IndexedDB 失败（${dbName}），请刷新后重试`],
      };
    } finally {
      db.close();
    }
  };

  try {
    if (typeof indexedDB.databases !== 'function') {
      return { count: 0 };
    }

    const databases = await indexedDB.databases();
    let count = 0;
    const errors: string[] = [];
    for (const db of databases) {
      if (!db.name) continue;
      const dbName = db.name;

      // 先清空 object store，再尝试 delete。若先 delete 且 blocked，
      // delete 请求仍 pending 时再 open 同库容易超时（如 Bing ImageCacheDB 连续清理）。
      const clearResult = await clearObjectStores(dbName);
      if (clearResult.success) {
        count++;
        continue;
      }

      const status = await waitForDeleteDatabase(dbName, deleteTimeoutMs);
      if (status === 'deleted') {
        count++;
        continue;
      }

      if (status === 'blocked' || status === 'timeout') {
        await delay(fallbackDelayMs);
        const retryClear = await clearObjectStores(dbName);
        if (retryClear.success) {
          count++;
        } else if (retryClear.errors.length > 0) {
          errors.push(...retryClear.errors);
        } else {
          errors.push(formatDeleteError(dbName, status));
        }
        continue;
      }

      if (clearResult.errors.length > 0) {
        errors.push(...clearResult.errors);
      } else {
        errors.push(formatDeleteError(dbName, status));
      }
    }

    return { count, errors };
  } catch (error) {
    return { count: 0, errors: [`读取或清理 IndexedDB 失败: ${String(error)}`] };
  }
}
