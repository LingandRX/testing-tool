/**
 * IndexedDB 工具模块 - 用于分块存储录制事件
 * 避免长时间录制导致内存溢出
 */

const DB_NAME = 'recording-events-db';
const DB_VERSION = 1;
const STORE_NAME = 'events';
const CHUNK_SIZE = 100; // 每个 chunk 存储的事件数量

export interface EventChunk {
  id: number;
  sessionId: string;
  chunkIndex: number;
  events: unknown[];
  timestamp: number;
}

interface RecordingSession {
  id: string;
  startTime: number;
  tabId: number;
  chunkCount: number;
  totalEvents: number;
}

let db: IDBDatabase | null = null;

/**
 * 打开数据库连接
 */
export async function openDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // 创建事件 chunk 存储
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('sessionId', 'sessionId', { unique: false });
        store.createIndex('chunkIndex', 'chunkIndex', { unique: false });
        store.createIndex('sessionId_chunkIndex', ['sessionId', 'chunkIndex'], { unique: true });
      }

      // 创建录制会话存储
      if (!database.objectStoreNames.contains('sessions')) {
        const sessionStore = database.createObjectStore('sessions', { keyPath: 'id' });
        sessionStore.createIndex('startTime', 'startTime', { unique: false });
      }
    };
  });
}

/**
 * 初始化新的录制会话
 */
export async function initRecordingSession(sessionId: string, tabId: number): Promise<void> {
  const database = await openDB();

  return new Promise((resolve, reject) => {
    const tx = database.transaction('sessions', 'readwrite');
    const store = tx.objectStore('sessions');

    const session: RecordingSession = {
      id: sessionId,
      startTime: Date.now(),
      tabId,
      chunkCount: 0,
      totalEvents: 0,
    };

    const request = store.put(session);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * 获取当前会话的 chunk 数量
 */
export async function getSessionChunkCount(sessionId: string): Promise<number> {
  const database = await openDB();

  return new Promise((resolve, reject) => {
    const tx = database.transaction('sessions', 'readonly');
    const store = tx.objectStore('sessions');
    const request = store.get(sessionId);

    request.onsuccess = () => {
      const session = request.result as RecordingSession | undefined;
      resolve(session?.chunkCount || 0);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * 追加事件到存储（自动分块）
 * 当当前 chunk 满时创建新 chunk
 */
export async function appendEvents(sessionId: string, newEvents: unknown[]): Promise<void> {
  const database = await openDB();
  const chunkCount = await getSessionChunkCount(sessionId);

  // 获取或创建当前 chunk
  let currentChunk: EventChunk | null = null;
  let currentChunkIndex = chunkCount > 0 ? chunkCount - 1 : 0;

  if (chunkCount > 0) {
    currentChunk = await getChunk(database, sessionId, currentChunkIndex);
  }

  // 如果当前 chunk 不存在或已满，创建新 chunk
  if (!currentChunk || currentChunk.events.length >= CHUNK_SIZE) {
    currentChunkIndex = chunkCount;
    currentChunk = {
      id: 0, // 将由 IndexedDB 自动分配
      sessionId,
      chunkIndex: currentChunkIndex,
      events: [],
      timestamp: Date.now(),
    };

    // 更新会话的 chunk 计数
    await updateSessionChunkCount(database, sessionId, chunkCount + 1);
  }

  // 将新事件添加到当前 chunk
  currentChunk.events.push(...newEvents);

  // 保存 chunk
  await saveChunk(database, currentChunk);
}

/**
 * 获取指定 chunk
 */
async function getChunk(
  database: IDBDatabase,
  sessionId: string,
  chunkIndex: number,
): Promise<EventChunk | null> {
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('sessionId_chunkIndex');
    const request = index.get([sessionId, chunkIndex]);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * 保存 chunk
 */
async function saveChunk(database: IDBDatabase, chunk: EventChunk): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(chunk);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * 更新会话的 chunk 计数
 */
async function updateSessionChunkCount(
  database: IDBDatabase,
  sessionId: string,
  chunkCount: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = database.transaction('sessions', 'readwrite');
    const store = tx.objectStore('sessions');
    const getRequest = store.get(sessionId);

    getRequest.onsuccess = () => {
      const session = getRequest.result as RecordingSession | undefined;
      if (session) {
        session.chunkCount = chunkCount;
        const putRequest = store.put(session);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve();
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

/**
 * 流式读取所有事件（按 chunk 顺序）
 * 使用回调方式避免一次性加载所有事件到内存
 */
export async function streamAllEvents(
  sessionId: string,
  onChunk: (events: unknown[]) => void | Promise<void>,
): Promise<void> {
  const database = await openDB();
  const chunkCount = await getSessionChunkCount(sessionId);

  for (let i = 0; i < chunkCount; i++) {
    const chunk = await getChunk(database, sessionId, i);
    if (chunk && chunk.events.length > 0) {
      await onChunk(chunk.events);
    }
  }
}

/**
 * 获取所有事件（用于下载，一次性加载）
 * 注意：这会将所有事件加载到内存，仅在需要导出时调用
 */
export async function getAllEvents(sessionId: string): Promise<unknown[]> {
  const allEvents: unknown[] = [];

  await streamAllEvents(sessionId, (events) => {
    allEvents.push(...events);
  });

  return allEvents;
}

/**
 * 删除录制会话的所有数据
 */
export async function deleteRecordingSession(sessionId: string): Promise<void> {
  const database = await openDB();

  return new Promise((resolve, reject) => {
    // 删除所有相关的 chunk
    const chunkTx = database.transaction(STORE_NAME, 'readwrite');
    const chunkStore = chunkTx.objectStore(STORE_NAME);
    const index = chunkStore.index('sessionId');
    const request = index.openCursor(IDBKeyRange.only(sessionId));

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    chunkTx.oncomplete = () => {
      // 删除会话记录
      const sessionTx = database.transaction('sessions', 'readwrite');
      const sessionStore = sessionTx.objectStore('sessions');
      const deleteRequest = sessionStore.delete(sessionId);

      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };

    chunkTx.onerror = () => reject(chunkTx.error);
  });
}

/**
 * 生成唯一的会话 ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 清理数据库（用于调试或重置）
 */
export async function clearDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => {
      db = null;
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}
