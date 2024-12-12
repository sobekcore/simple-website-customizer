import { STORAGE_PREFIX } from '@shared/const';

export interface UseChromeStorageReturn {
  get<T = unknown>(key: string): Promise<T>;
  set<T = unknown>(key: string, value: T): Promise<void>;
}

export function useChromeStorage(): UseChromeStorageReturn {
  const get = <T = unknown>(key: string): Promise<T> => {
    return new Promise((resolve): void => {
      chrome.storage.local.get(`${STORAGE_PREFIX}.${key}`, (storage: Record<string, any>): void => {
        resolve(storage[`${STORAGE_PREFIX}.${key}`]);
      });
    });
  };

  const set = <T = unknown>(key: string, value: T): Promise<void> => {
    return new Promise((resolve): void => {
      chrome.storage.local.set({ [`${STORAGE_PREFIX}.${key}`]: value }, (): void => {
        resolve();
      });
    });
  };

  return {
    get,
    set,
  };
}
