import type { DashboardSnapshot } from './types';

export type QueuedMutation = {
  id: string;
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  body: unknown;
  createdAt: string;
};

const DB_NAME = 'smart-lambak';
const MUTATION_STORE = 'mutation-queue';
const DASHBOARD_KEY = 'latest-dashboard';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is unavailable'));
      return;
    }

    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(MUTATION_STORE)) {
        database.createObjectStore(MUTATION_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, callback: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(MUTATION_STORE, mode);
    const request = callback(transaction.objectStore(MUTATION_STORE));
    request.onsuccess = () => {
      transaction.oncomplete = () => {
        database.close();
        resolve(request.result);
      };
    };
    request.onerror = () => {
      database.close();
      reject(request.error);
    };
  });
}

export async function enqueueMutation(input: Omit<QueuedMutation, 'id' | 'createdAt'>): Promise<QueuedMutation> {
  const mutation: QueuedMutation = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input
  };
  await withStore('readwrite', (store) => store.put(mutation));
  return mutation;
}

export async function getQueuedMutations(): Promise<QueuedMutation[]> {
  try {
    const result = await withStore<QueuedMutation[]>('readonly', (store) => store.getAll());
    return result.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  } catch {
    return [];
  }
}

export async function deleteQueuedMutation(id: string): Promise<void> {
  await withStore('readwrite', (store) => store.delete(id));
}

export async function clearMutationQueue(): Promise<void> {
  await withStore('readwrite', (store) => store.clear());
}

export async function flushMutationQueue(onUnauthorized?: (mutation: QueuedMutation, error: Error) => void): Promise<{ flushed: number; failed: number }> {
  const queue = await getQueuedMutations();
  let flushed = 0;

  for (const mutation of queue) {
    try {
      const response = await fetch(mutation.path, {
        method: mutation.method,
        headers: mutation.body ? { 'Content-Type': 'application/json' } : undefined,
        body: mutation.body ? JSON.stringify(mutation.body) : undefined
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? `Request failed with ${response.status}`);
      }
      await deleteQueuedMutation(mutation.id);
      flushed += 1;
    } catch (error) {
      onUnauthorized?.(mutation, error instanceof Error ? error : new Error('Offline replay failed'));
      return { flushed, failed: queue.length - flushed };
    }
  }

  return { flushed, failed: 0 };
}

export async function cacheDashboard(snapshot: DashboardSnapshot): Promise<void> {
  try {
    window.localStorage.setItem(DASHBOARD_KEY, JSON.stringify(snapshot));
  } catch {
    // Private mode or storage pressure should not affect the live app.
  }
}

export async function getCachedDashboard(): Promise<DashboardSnapshot | null> {
  try {
    const raw = window.localStorage.getItem(DASHBOARD_KEY);
    return raw ? (JSON.parse(raw) as DashboardSnapshot) : null;
  } catch {
    return null;
  }
}
