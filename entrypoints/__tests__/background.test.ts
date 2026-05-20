import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  createAllContextMenus,
  parseContextMenuClick,
  CONTEXT_MENU_CONFIGS,
  MAX_PAYLOAD_LENGTH,
} from '@/utils/contextMenu';
import { MessageAction } from '@/utils/messages';

describe('background 菜单注册与分流', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('菜单注册', () => {
    it('应该调用 createAllContextMenus 创建所有菜单项', () => {
      createAllContextMenus();

      expect(chrome.contextMenus.create).toHaveBeenCalledTimes(CONTEXT_MENU_CONFIGS.length);
    });

    it('应该创建父级菜单 Testing Tools', () => {
      createAllContextMenus();

      expect(chrome.contextMenus.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'testing-tools-parent',
          title: 'Testing Tools',
        }),
      );
    });

    it('应该创建 JWT 解析子菜单', () => {
      createAllContextMenus();

      expect(chrome.contextMenus.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'jwt',
          title: '🔑 解析 JWT',
          parentId: 'testing-tools-parent',
        }),
      );
    });

    it('应该创建网页链接转二维码子菜单', () => {
      createAllContextMenus();

      expect(chrome.contextMenus.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'qrCode-page',
          title: '🔗 网页链接转二维码',
          contexts: ['page'],
        }),
      );
    });
  });

  describe('菜单点击解析', () => {
    const createMockOnClickData = (
      overrides: Partial<chrome.contextMenus.OnClickData> = {},
    ): chrome.contextMenus.OnClickData => ({
      menuItemId: 'test',
      editable: false,
      pageUrl: 'https://example.com',
      ...overrides,
    });

    it('当有 selectionText 时应返回对应的 featureKey 和 payload', () => {
      const info = createMockOnClickData({
        menuItemId: 'jwt',
        selectionText: 'test-token',
      });

      const result = parseContextMenuClick('jwt', info);

      expect(result).toEqual({
        success: true,
        data: { featureKey: 'jwt', payload: 'test-token' },
      });
    });

    it('当没有 selectionText 和 srcUrl 时应返回错误', () => {
      const info = createMockOnClickData({
        menuItemId: 'unknown',
        pageUrl: undefined,
      });

      const result = parseContextMenuClick('unknown', info);

      expect(result).toEqual({
        success: false,
        error: '无法获取有效数据',
      });
    });

    it('当文本超过最大长度限制时应截断', () => {
      const longText = 'a'.repeat(MAX_PAYLOAD_LENGTH + 1000);
      const info = createMockOnClickData({
        menuItemId: 'textStatistics',
        selectionText: longText,
      });

      const result = parseContextMenuClick('textStatistics', info);

      expect(result.success).toBe(true);
      expect(result.data?.payload.length).toBe(MAX_PAYLOAD_LENGTH);
    });

    it('当文本未超过最大长度限制时应保持原样', () => {
      const shortText = 'short text';
      const info = createMockOnClickData({
        menuItemId: 'textStatistics',
        selectionText: shortText,
      });

      const result = parseContextMenuClick('textStatistics', info);

      expect(result).toEqual({
        success: true,
        data: { featureKey: 'textStatistics', payload: 'short text' },
      });
    });

    it('应该正确处理页面 URL 菜单点击', () => {
      const info = createMockOnClickData({
        menuItemId: 'storageCleaner',
        pageUrl: 'https://example.com/page',
      });

      const result = parseContextMenuClick('storageCleaner', info);

      expect(result).toEqual({
        success: true,
        data: { featureKey: 'storageCleaner', payload: 'https://example.com/page' },
      });
    });
  });

  describe('消息类型定义', () => {
    it('CONTEXT_MENU_CLICKED 消息类型应正确定义', () => {
      expect(MessageAction.CONTEXT_MENU_CLICKED).toBe('contextMenuClicked');
    });
  });
});
