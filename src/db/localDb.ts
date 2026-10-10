// 浏览器本地数据库访问层（IndexedDB）
// 存档、收集进度与设置全部保存在玩家浏览器本机，不请求任何后端服务。
// 若浏览器不支持或禁用了 IndexedDB（例如部分隐私模式），自动降级到 localStorage；
// 两个后端都不可用时退化为内存存储（仅当次会话有效，不影响游戏运行）。

const DB_NAME = 'galagame';
const DB_VERSION = 1;
const STORE_NAME = 'kv';

export type LocalDbBackend = 'indexeddb' | 'localstorage' | 'memory';

let backend: LocalDbBackend | null = null;
let db: IDBDatabase | null = null;

const memoryFallback = new Map<string, string>();

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('当前环境不支持 IndexedDB'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const instance = request.result;
      if (!instance.objectStoreNames.contains(STORE_NAME)) {
        instance.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('打开本地数据库失败'));
    request.onblocked = () => reject(new Error('本地数据库被其他页面占用'));
  });
}

/** 初始化本地数据库，返回实际使用的后端类型（可重复调用） */
export async function initLocalDb(): Promise<LocalDbBackend> {
  if (backend) return backend;
  try {
    db = await openIdb();
    backend = 'indexeddb';
  } catch {
    db = null;
    backend = typeof localStorage === 'undefined' ? 'memory' : 'localstorage';
  }
  return backend;
}

export function dbBackend(): LocalDbBackend {
  return backend ?? 'memory';
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('本地数据库读写失败'));
  });
}

function idbStore(mode: IDBTransactionMode): IDBObjectStore {
  if (!db) throw new Error('本地数据库尚未初始化');
  return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
}

function lsKey(key: string): string {
  return key;
}

/** 读取全部键值（IndexedDB 全量导出，供启动时载入内存镜像与备份使用） */
export async function dbGetAll(): Promise<Record<string, unknown>> {
  await initLocalDb();
  const result: Record<string, unknown> = {};

  if (backend === 'indexeddb' && db) {
    const store = idbStore('readonly');
    const keys = await requestToPromise(store.getAllKeys());
    const values = await requestToPromise(store.getAll());
    keys.forEach((key, index) => {
      result[String(key)] = values[index];
    });
    return result;
  }

  if (backend === 'localstorage') {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key) continue;
      const raw = localStorage.getItem(key);
      if (raw === null) continue;
      try {
        result[key] = JSON.parse(raw);
      } catch {
        // 忽略无法解析的历史数据
      }
    }
    return result;
  }

  for (const [key, raw] of memoryFallback.entries()) {
    try {
      result[key] = JSON.parse(raw);
    } catch {
      // 忽略
    }
  }
  return result;
}

/** 写入单个键值 */
export async function dbSet(key: string, value: unknown): Promise<void> {
  await initLocalDb();
  if (backend === 'indexeddb') {
    await requestToPromise(idbStore('readwrite').put(value, key));
    return;
  }
  const raw = JSON.stringify(value);
  if (backend === 'localstorage') {
    localStorage.setItem(lsKey(key), raw);
    return;
  }
  memoryFallback.set(key, raw);
}

/** 删除单个键值 */
export async function dbRemove(key: string): Promise<void> {
  await initLocalDb();
  if (backend === 'indexeddb') {
    await requestToPromise(idbStore('readwrite').delete(key));
    return;
  }
  if (backend === 'localstorage') {
    localStorage.removeItem(lsKey(key));
    return;
  }
  memoryFallback.delete(key);
}

/** 清空本地数据库 */
export async function dbClear(): Promise<void> {
  await initLocalDb();
  if (backend === 'indexeddb') {
    await requestToPromise(idbStore('readwrite').clear());
    return;
  }
  if (backend === 'localstorage') {
    for (const key of await dbKeys()) localStorage.removeItem(lsKey(key));
    return;
  }
  memoryFallback.clear();
}

/** 列出全部键名 */
export async function dbKeys(): Promise<string[]> {
  await initLocalDb();
  if (backend === 'indexeddb' && db) {
    const keys = await requestToPromise(idbStore('readonly').getAllKeys());
    return keys.map(String);
  }
  if (backend === 'localstorage') {
    return Object.keys(localStorage);
  }
  return [...memoryFallback.keys()];
}
