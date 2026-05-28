import { describe, expect, it, vi, beforeEach } from 'vitest';
import { sendMessageToContent, MessageAction } from '@/utils/messages';

// Mock @webext-core/messaging - vi.mock is hoisted, so we define mock inside factory
vi.mock('@webext-core/messaging', () => {
  const mockSendMessage = vi.fn();
  return {
    defineExtensionMessaging: () => ({
      sendMessage: mockSendMessage,
      onMessage: vi.fn(),
    }),
    // Export the mock so we can access it in tests
    __mockSendMessage: mockSendMessage,
  };
});

// Helper to get the mock function from the mocked module
async function getMockSendMessage() {
  const mod = await import('@webext-core/messaging');
  return (mod as any).__mockSendMessage;
}

describe('messages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendMessageToContent', () => {
    it('应该成功发送消息到内容脚本并返回响应', async () => {
      const mockSendMessage = await getMockSendMessage();
      const mockResponse = { success: true };
      mockSendMessage.mockResolvedValue(mockResponse);

      const mockTab = { id: 123, url: 'https://example.com' };
      (chrome.tabs.query as any).mockResolvedValue([mockTab]);

      const result = await sendMessageToContent(MessageAction.RELOAD_TAB, { tabId: 123 });

      expect(result).toEqual(mockResponse);
      expect(mockSendMessage).toHaveBeenCalledWith(MessageAction.RELOAD_TAB, { tabId: 123 }, 123);
    });

    it('应该支持不带数据的消息发送', async () => {
      const mockSendMessage = await getMockSendMessage();
      mockSendMessage.mockResolvedValue(undefined);

      const mockTab = { id: 456, url: 'https://example.com' };
      (chrome.tabs.query as any).mockResolvedValue([mockTab]);

      await sendMessageToContent(MessageAction.SIDE_PANEL_STATE_CHANGED, { isOpen: true });

      expect(mockSendMessage).toHaveBeenCalledWith(
        MessageAction.SIDE_PANEL_STATE_CHANGED,
        { isOpen: true },
        456,
      );
    });

    it('当无法获取当前标签页时应返回错误', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      (chrome.tabs.query as any).mockResolvedValue([]);

      const result = await sendMessageToContent(MessageAction.RELOAD_TAB, { tabId: 123 });

      expect(result).toEqual({ success: false, message: '无法获取当前标签页' });
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Messaging] 无法获取当前标签页，无法发送动作: reloadTab',
      );
      consoleSpy.mockRestore();
    });

    it('当标签页没有 id 时应返回错误', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      (chrome.tabs.query as any).mockResolvedValue([{ url: 'https://example.com' }]);

      const result = await sendMessageToContent(MessageAction.RELOAD_TAB, { tabId: 123 });

      expect(result).toEqual({ success: false, message: '无法获取当前标签页' });
      consoleSpy.mockRestore();
    });

    it('当连接无法建立时应返回特定错误消息', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockSendMessage = await getMockSendMessage();
      mockSendMessage.mockRejectedValue(new Error('Could not establish connection'));

      const mockTab = { id: 123, url: 'https://example.com' };
      (chrome.tabs.query as any).mockResolvedValue([mockTab]);

      const result = await sendMessageToContent(MessageAction.RELOAD_TAB, { tabId: 123 });

      expect(result).toEqual({
        success: false,
        message: '无法连接到网页，请刷新页面后再试',
      });
      consoleSpy.mockRestore();
    });

    it('当响应超时时应返回特定错误消息', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockSendMessage = await getMockSendMessage();
      mockSendMessage.mockRejectedValue(new Error('No response received'));

      const mockTab = { id: 123, url: 'https://example.com' };
      (chrome.tabs.query as any).mockResolvedValue([mockTab]);

      const result = await sendMessageToContent(MessageAction.RELOAD_TAB, { tabId: 123 });

      expect(result).toEqual({
        success: false,
        message: '网页响应超时，请重试',
      });
      consoleSpy.mockRestore();
    });

    it('当发生其他错误时应返回通用错误消息', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockSendMessage = await getMockSendMessage();
      mockSendMessage.mockRejectedValue(new Error('Unknown error'));

      const mockTab = { id: 123, url: 'https://example.com' };
      (chrome.tabs.query as any).mockResolvedValue([mockTab]);

      const result = await sendMessageToContent(MessageAction.RELOAD_TAB, { tabId: 123 });

      expect(result).toEqual({
        success: false,
        message: '通信失败: Unknown error',
      });
      consoleSpy.mockRestore();
    });

    it('当错误不是 Error 实例时应正确处理字符串错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockSendMessage = await getMockSendMessage();
      mockSendMessage.mockRejectedValue('string error');

      const mockTab = { id: 123, url: 'https://example.com' };
      (chrome.tabs.query as any).mockResolvedValue([mockTab]);

      const result = await sendMessageToContent(MessageAction.RELOAD_TAB, { tabId: 123 });

      expect(result).toEqual({
        success: false,
        message: '通信失败: string error',
      });
      consoleSpy.mockRestore();
    });

    it('当 tabs.query 失败时应返回错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (chrome.tabs.query as any).mockRejectedValue(new Error('Query failed'));

      const result = await sendMessageToContent(MessageAction.RELOAD_TAB, { tabId: 123 });

      expect(result).toEqual({
        success: false,
        message: '通信失败: Query failed',
      });
      consoleSpy.mockRestore();
    });
  });
});
