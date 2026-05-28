import { describe, expect, it, vi } from 'vitest';
import {
  getActiveTab,
  getActiveTabDomain,
  openExtensionPage,
  ensureContentScriptInjected,
} from '@/utils/chromeTabs';

describe('chromeTabs', () => {
  describe('getActiveTab', () => {
    it('应该返回当前活动标签页', async () => {
      const mockTab = { id: 1, url: 'https://example.com', title: 'Example' } as chrome.tabs.Tab;
      (chrome.tabs.query as any).mockResolvedValue([mockTab]);

      const result = await getActiveTab();

      expect(result).toEqual(mockTab);
      expect(chrome.tabs.query).toHaveBeenCalledWith({ active: true, currentWindow: true });
    });

    it('当没有活动标签页时应返回 null', async () => {
      (chrome.tabs.query as any).mockResolvedValue([]);

      const result = await getActiveTab();

      expect(result).toBeNull();
    });

    it('当查询失败时应返回 null 并记录错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (chrome.tabs.query as any).mockRejectedValue(new Error('Permission denied'));

      const result = await getActiveTab();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('获取活动标签页失败:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('getActiveTabDomain', () => {
    it('应该返回当前活动标签页的域名', async () => {
      const mockTab = { id: 1, url: 'https://example.com/path?query=1' } as chrome.tabs.Tab;
      (chrome.tabs.query as any).mockResolvedValue([mockTab]);

      const result = await getActiveTabDomain();

      expect(result).toBe('example.com');
    });

    it('应该处理带有端口的 URL', async () => {
      const mockTab = { id: 1, url: 'https://example.com:8080/path' } as chrome.tabs.Tab;
      (chrome.tabs.query as any).mockResolvedValue([mockTab]);

      const result = await getActiveTabDomain();

      expect(result).toBe('example.com');
    });

    it('当标签页没有 URL 时应返回空字符串', async () => {
      const mockTab = { id: 1 } as chrome.tabs.Tab;
      (chrome.tabs.query as any).mockResolvedValue([mockTab]);

      const result = await getActiveTabDomain();

      expect(result).toBe('');
    });

    it('当没有活动标签页时应返回空字符串', async () => {
      (chrome.tabs.query as any).mockResolvedValue([]);

      const result = await getActiveTabDomain();

      expect(result).toBe('');
    });

    it('当 URL 解析失败时应返回空字符串并记录错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockTab = { id: 1, url: 'not-a-valid-url' } as chrome.tabs.Tab;
      (chrome.tabs.query as any).mockResolvedValue([mockTab]);

      const result = await getActiveTabDomain();

      expect(result).toBe('');
      expect(consoleSpy).toHaveBeenCalledWith('解析域名失败:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('应该处理 chrome-extension URL', async () => {
      const mockTab = { id: 1, url: 'chrome-extension://abc123/popup.html' } as chrome.tabs.Tab;
      (chrome.tabs.query as any).mockResolvedValue([mockTab]);

      const result = await getActiveTabDomain();

      expect(result).toBe('abc123');
    });
  });

  describe('openExtensionPage', () => {
    it('应该在新标签页中打开扩展页面', async () => {
      await openExtensionPage('popup.html');

      expect(chrome.runtime.getURL).toHaveBeenCalledWith('popup.html');
      expect(chrome.tabs.create).toHaveBeenCalledWith({
        url: 'chrome-extension://test-extension-id/popup.html',
      });
    });

    it('应该支持带查询参数的扩展页面', async () => {
      await openExtensionPage('options.html', { tab: 'settings', id: '123' });

      expect(chrome.tabs.create).toHaveBeenCalledWith({
        url: 'chrome-extension://test-extension-id/options.html?tab=settings&id=123',
      });
    });

    it('当创建标签页失败时应记录错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (chrome.tabs.create as any).mockRejectedValue(new Error('Tab creation failed'));

      await openExtensionPage('popup.html');

      expect(consoleSpy).toHaveBeenCalledWith('打开扩展页面失败:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('ensureContentScriptInjected', () => {
    it('当存在活动标签页时应返回 true', async () => {
      const mockTab = { id: 123, url: 'https://example.com' } as chrome.tabs.Tab;
      (chrome.tabs.query as any).mockResolvedValue([mockTab]);

      const result = await ensureContentScriptInjected();

      expect(result).toBe(true);
    });

    it('当没有活动标签页时应返回 false', async () => {
      (chrome.tabs.query as any).mockResolvedValue([]);

      const result = await ensureContentScriptInjected();

      expect(result).toBe(false);
    });

    it('当标签页没有 id 时应返回 false', async () => {
      const mockTab = { url: 'https://example.com' } as chrome.tabs.Tab;
      (chrome.tabs.query as any).mockResolvedValue([mockTab]);

      const result = await ensureContentScriptInjected();

      expect(result).toBe(false);
    });

    it('当整体操作失败时应返回 false 并记录错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (chrome.tabs.query as any).mockRejectedValue(new Error('Query failed'));

      const result = await ensureContentScriptInjected();

      expect(result).toBe(false);
      // getActiveTab catches the error and logs "获取活动标签页失败"
      expect(consoleSpy).toHaveBeenCalledWith('获取活动标签页失败:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});
