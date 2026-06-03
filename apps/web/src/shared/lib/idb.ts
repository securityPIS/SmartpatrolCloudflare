/**
 * Tiny promise-based IndexedDB wrapper (no deps). One database, two stores:
 *  - `images`: captured photo blobs keyed by a local id (referenced as idb://<id>)
 *  - `outbox`: queued patrol submissions awaiting flush to the API
 */
const DB_NAME = "smartpatrol";
const DB_VERSION = 1;
export const IMAGES_STORE = "images";
export const OUTBOX_STORE = "outbox";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IMAGES_STORE)) db.createObjectStore(IMAGES_STORE);
      if (!db.objectStoreNames.contains(OUTBOX_STORE)) db.createObjectStore(OUTBOX_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx<T>(
  store: string,
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const req = fn(t.objectStore(store));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export const idbPut = <T>(store: string, key: IDBValidKey, value: T) =>
  tx<IDBValidKey>(store, "readwrite", (s) => s.put(value, key)).then(() => undefined);

export const idbGet = <T>(store: string, key: IDBValidKey) =>
  tx<T | undefined>(store, "readonly", (s) => s.get(key) as IDBRequest<T | undefined>);

export const idbDelete = (store: string, key: IDBValidKey) =>
  tx<undefined>(store, "readwrite", (s) => s.delete(key) as IDBRequest<undefined>);

export const idbGetAll = <T>(store: string) =>
  tx<T[]>(store, "readonly", (s) => s.getAll() as IDBRequest<T[]>);

export const idbGetAllKeys = (store: string) =>
  tx<IDBValidKey[]>(store, "readonly", (s) => s.getAllKeys() as IDBRequest<IDBValidKey[]>);
