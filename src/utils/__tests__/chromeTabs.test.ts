import { describe, expect, it, vi } from 'vitest';
import { openExtensionPage } from '@/utils/chromeTabs';

describe('chromeTabs', () => {
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
