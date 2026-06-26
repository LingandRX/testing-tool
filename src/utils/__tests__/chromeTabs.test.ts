import { describe, expect, it, vi } from 'vitest';
import { getCurrentTab, openExtensionPage } from '@/utils/chromeTabs';

describe('chromeTabs', () => {
  describe('getCurrentTab', () => {
    it('应优先使用 lastFocusedWindow 查询当前标签页', async () => {
      const mockTab = { id: 1, url: 'https://example.com' };
      (browser.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValueOnce([mockTab]);

      const tab = await getCurrentTab();

      expect(tab).toEqual(mockTab);
      expect(browser.tabs.query).toHaveBeenCalledWith({
        active: true,
        lastFocusedWindow: true,
      });
    });

    it('当 lastFocusedWindow 无结果时应回退到 currentWindow', async () => {
      const fallbackTab = { id: 2, url: 'https://fallback.com' };
      (browser.tabs.query as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([fallbackTab]);

      const tab = await getCurrentTab();

      expect(tab).toEqual(fallbackTab);
      expect(browser.tabs.query).toHaveBeenLastCalledWith({
        active: true,
        currentWindow: true,
      });
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

    it('当创建标签页失败时应记录错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (chrome.tabs.create as any).mockRejectedValue(new Error('Tab creation failed'));

      await openExtensionPage('popup.html');

      expect(consoleSpy).toHaveBeenCalledWith('打开扩展页面失败:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});
