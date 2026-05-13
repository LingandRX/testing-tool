import { describe, expect, it, vi } from 'vitest';
import { storageUtil } from '@/utils/chromeStorage';

describe('chromeStorage', () => {
  describe('get', () => {
    it('应该返回存储的值', async () => {
      (chrome.storage.local.get as any).mockResolvedValue({ 'app/theme': 'dark' });

      const result = await storageUtil.get('app/theme');

      expect(result).toBe('dark');
      expect(chrome.storage.local.get).toHaveBeenCalledWith(['app/theme']);
    });

    it('当键不存在时应返回默认值', async () => {
      (chrome.storage.local.get as any).mockResolvedValue({});

      const result = await storageUtil.get('app/theme', 'light');

      expect(result).toBe('light');
    });

    it('当键不存在且未提供默认值时应返回 undefined', async () => {
      (chrome.storage.local.get as any).mockResolvedValue({});

      const result = await storageUtil.get('app/theme');

      expect(result).toBeUndefined();
    });

    it('应该支持布尔类型值', async () => {
      (chrome.storage.local.get as any).mockResolvedValue({ 'qrCode/qrExpanded': true });

      const result = await storageUtil.get('qrCode/qrExpanded');

      expect(result).toBe(true);
    });

    it('应该支持数组类型值', async () => {
      const pages = ['dashboard', 'timestamp'] as const;
      (chrome.storage.local.get as any).mockResolvedValue({ 'app/visiblePages': pages });

      const result = await storageUtil.get('app/visiblePages');

      expect(result).toEqual(pages);
    });

    it('应该支持复杂对象类型值', async () => {
      const preferences = {
        autoRefresh: true,
        selectedTypes: {
          localStorage: true,
          sessionStorage: false,
          indexedDB: true,
          cookies: false,
          cacheStorage: false,
          serviceWorkers: false,
        },
      };
      (chrome.storage.local.get as any).mockResolvedValue({
        'storageCleaner/preferences': preferences,
      });

      const result = await storageUtil.get('storageCleaner/preferences');

      expect(result).toEqual(preferences);
    });

    it('当存储值为 null 时应返回默认值', async () => {
      (chrome.storage.local.get as any).mockResolvedValue({ 'app/theme': null });

      const result = await storageUtil.get('app/theme', 'light');

      expect(result).toBe('light');
    });
  });

  describe('set', () => {
    it('应该成功设置字符串值', async () => {
      (chrome.storage.local.set as any).mockResolvedValue(undefined);

      await storageUtil.set('app/theme', 'dark');

      expect(chrome.storage.local.set).toHaveBeenCalledWith({ 'app/theme': 'dark' });
    });

    it('应该成功设置布尔值', async () => {
      await storageUtil.set('qrCode/qrExpanded', true);

      expect(chrome.storage.local.set).toHaveBeenCalledWith({ 'qrCode/qrExpanded': true });
    });

    it('应该成功设置数组值', async () => {
      const pages: Array<'dashboard' | 'timestamp'> = ['dashboard', 'timestamp'];
      await storageUtil.set('app/visiblePages', pages);

      expect(chrome.storage.local.set).toHaveBeenCalledWith({ 'app/visiblePages': pages });
    });

    it('应该成功设置复杂对象值', async () => {
      const preferences = {
        autoRefresh: false,
        selectedTypes: {
          localStorage: true,
          sessionStorage: true,
          indexedDB: false,
          cookies: false,
          cacheStorage: false,
          serviceWorkers: false,
        },
      };
      await storageUtil.set('storageCleaner/preferences', preferences);

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        'storageCleaner/preferences': preferences,
      });
    });

    it('应该成功设置枚举类型值', async () => {
      await storageUtil.set('jsonTools/pageMode', 'yaml');

      expect(chrome.storage.local.set).toHaveBeenCalledWith({ 'jsonTools/pageMode': 'yaml' });
    });
  });

  describe('remove', () => {
    it('应该成功删除指定键', async () => {
      await storageUtil.remove('app/theme');

      expect(chrome.storage.local.remove).toHaveBeenCalledWith(['app/theme']);
    });

    it('应该成功删除不同键', async () => {
      await storageUtil.remove('qrCode/qrExpanded');

      expect(chrome.storage.local.remove).toHaveBeenCalledWith(['qrCode/qrExpanded']);
    });
  });
});
