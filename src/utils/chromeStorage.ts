import { StorageSchema } from '@/types/storage';

class StorageUtils {
  async get<K extends keyof StorageSchema>(
    key: K,
    defaultValue: StorageSchema[K],
  ): Promise<StorageSchema[K]>;

  async get<K extends keyof StorageSchema>(key: K): Promise<StorageSchema[K] | undefined>;

  /**
   * 获取值
   * @param key
   * @param defaultValue
   * @returns
   */
  async get<K extends keyof StorageSchema>(
    key: K,
    defaultValue?: StorageSchema[K],
  ): Promise<StorageSchema[K] | undefined> {
    const result = await this.getMany([key]);
    if (defaultValue !== undefined) {
      return (result[key] ?? defaultValue) as StorageSchema[K];
    }
    return result[key] as StorageSchema[K] | undefined;
  }

  /**
   * 批量获取多个键（单次 IPC）
   */
  async getMany<K extends keyof StorageSchema>(
    keys: readonly K[],
  ): Promise<Partial<Pick<StorageSchema, K>>> {
    if (keys.length === 0) {
      return {};
    }
    const result = await chrome.storage.local.get([...keys]);
    return result as Partial<Pick<StorageSchema, K>>;
  }

  /**
   * 设置值
   * @param key
   * @param value
   */
  async set<K extends keyof StorageSchema>(key: K, value: StorageSchema[K]): Promise<void> {
    await chrome.storage.local.set({ [key]: value });
  }

  /**
   * 删除值
   * @param key
   */
  async remove(key: keyof StorageSchema): Promise<void> {
    await chrome.storage.local.remove([key]);
  }
}

export const storageUtil = new StorageUtils();
