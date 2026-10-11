// Persists the local test database in IndexedDB (falls back to memory, e.g. in private windows).
const DB_NAME = 'abhinomous-local';
const STORE = 'state';
const KEY = 'current';

let memory: unknown;
let opening: Promise<IDBDatabase> | undefined;

function open() {
  opening ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return opening;
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const request = action(db.transaction(STORE, mode).objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadState<T>(): Promise<T | undefined> {
  try {
    return await run<T | undefined>('readonly', (s) => s.get(KEY));
  } catch {
    return memory as T | undefined;
  }
}

export async function saveState(value: unknown) {
  try {
    await run('readwrite', (s) => s.put(value, KEY));
  } catch {
    memory = value;
  }
}
