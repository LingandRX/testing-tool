import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  CONTEXT_MENU_CONFIGS,
  createAllContextMenus,
  parseContextMenuClick,
  MAX_PAYLOAD_LENGTH,
} from '@/utils/contextMenu';

describe('contextMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CONTEXT_MENU_CONFIGS', () => {
    it('应该包含 8 个菜单项配置', () => {
      expect(CONTEXT_MENU_CONFIGS).toHaveLength(8);
    });

    it('应该有一个父级菜单项 Testing Tools', () => {
      const parentMenu = CONTEXT_MENU_CONFIGS.find((c) => c.id === 'testing-tools-parent');
      expect(parentMenu).toBeDefined();
      expect(parentMenu?.title).toBe('Testing Tools');
      expect(parentMenu?.parentId).toBeUndefined();
    });

    it('应该有 4 个 selection 上下文的子菜单', () => {
      const selectionMenus = CONTEXT_MENU_CONFIGS.filter(
        (c) => c.contexts[0] === 'selection' && c.parentId === 'testing-tools-parent',
      );
      expect(selectionMenus).toHaveLength(4);
      expect(selectionMenus.map((m) => m.id)).toEqual([
        'jwt',
        'base64Converter',
        'textStatistics',
        'timestamp',
      ]);
    });

    it('应该有 2 个 page 上下文的子菜单', () => {
      const pageMenus = CONTEXT_MENU_CONFIGS.filter(
        (c) => c.contexts[0] === 'page' && c.parentId === 'testing-tools-parent',
      );
      expect(pageMenus).toHaveLength(2);
      expect(pageMenus.map((m) => m.id)).toEqual(['storageCleaner', 'qrCode-page']);
    });

    it('应该有 1 个 image 上下文的子菜单', () => {
      const imageMenus = CONTEXT_MENU_CONFIGS.filter(
        (c) => c.contexts[0] === 'image' && c.parentId === 'testing-tools-parent',
      );
      expect(imageMenus).toHaveLength(1);
      expect(imageMenus[0].id).toBe('qrCode-image');
      expect(imageMenus[0].title).toBe('🖼️ 解析图片二维码');
    });
  });

  describe('createAllContextMenus', () => {
    it('应该为每个配置调用 chrome.contextMenus.create', () => {
      createAllContextMenus();

      expect(chrome.contextMenus.create).toHaveBeenCalledTimes(8);
    });

    it('应该使用正确的参数创建菜单项', () => {
      createAllContextMenus();

      expect(chrome.contextMenus.create).toHaveBeenCalledWith({
        id: 'testing-tools-parent',
        title: 'Testing Tools',
        contexts: ['all'],
        parentId: undefined,
      });

      expect(chrome.contextMenus.create).toHaveBeenCalledWith({
        id: 'jwt',
        title: '🔑 解析 JWT',
        contexts: ['selection'],
        parentId: 'testing-tools-parent',
      });
    });
  });

  describe('parseContextMenuClick', () => {
    const createMockOnClickData = (
      overrides: Partial<chrome.contextMenus.OnClickData> = {},
    ): chrome.contextMenus.OnClickData => ({
      menuItemId: 'test',
      editable: false,
      pageUrl: 'https://example.com',
      ...overrides,
    });

    it('当点击 qrCode-page 菜单时应返回 qrCode 功能和 pageUrl', () => {
      const info = createMockOnClickData({
        pageUrl: 'https://example.com/page',
      });

      const result = parseContextMenuClick('qrCode-page', info);

      expect(result).toEqual({
        success: true,
        data: { featureKey: 'qrCode', payload: 'https://example.com/page' },
      });
    });

    it('当点击有 selectionText 的菜单时应返回对应功能和选中文本', () => {
      const info = createMockOnClickData({
        selectionText: 'selected text',
      });

      const result = parseContextMenuClick('jwt', info);

      expect(result).toEqual({
        success: true,
        data: { featureKey: 'jwt', payload: 'selected text' },
      });
    });

    it('当点击 timestamp 菜单时应正确映射功能键', () => {
      const info = createMockOnClickData({
        selectionText: '1234567890',
      });

      const result = parseContextMenuClick('timestamp', info);

      expect(result).toEqual({
        success: true,
        data: { featureKey: 'timestamp', payload: '1234567890' },
      });
    });

    it('当点击 storageCleaner 菜单时应返回 pageUrl', () => {
      const info = createMockOnClickData({
        pageUrl: 'https://example.com',
      });

      const result = parseContextMenuClick('storageCleaner', info);

      expect(result).toEqual({
        success: true,
        data: { featureKey: 'storageCleaner', payload: 'https://example.com' },
      });
    });

    it('当没有 selectionText 和 pageUrl 时应返回错误', () => {
      const info = createMockOnClickData({
        pageUrl: undefined,
      });

      const result = parseContextMenuClick('someMenu', info);

      expect(result).toEqual({
        success: false,
        error: '无法获取有效数据',
      });
    });

    it('selectionText 优先于 pageUrl', () => {
      const info = createMockOnClickData({
        selectionText: 'selected text',
        pageUrl: 'https://example.com',
      });

      const result = parseContextMenuClick('jwt', info);

      expect(result).toEqual({
        success: true,
        data: { featureKey: 'jwt', payload: 'selected text' },
      });
    });

    it('当文本超过最大长度限制时应截断', () => {
      const longText = 'a'.repeat(MAX_PAYLOAD_LENGTH + 1000);
      const info = createMockOnClickData({
        selectionText: longText,
      });

      const result = parseContextMenuClick('textStatistics', info);

      expect(result.success).toBe(true);
      expect(result.data?.payload.length).toBe(MAX_PAYLOAD_LENGTH);
    });

    it('当文本未超过最大长度限制时应保持原样', () => {
      const shortText = 'short text';
      const info = createMockOnClickData({
        selectionText: shortText,
      });

      const result = parseContextMenuClick('textStatistics', info);

      expect(result).toEqual({
        success: true,
        data: { featureKey: 'textStatistics', payload: 'short text' },
      });
    });

    it('当点击 qrCode-image 菜单时应返回 qrCode 功能和图片URL', () => {
      const info = createMockOnClickData({
        srcUrl: 'https://example.com/image.png',
      });

      const result = parseContextMenuClick('qrCode-image', info);

      expect(result).toEqual({
        success: true,
        data: { featureKey: 'qrCode', payload: 'https://example.com/image.png' },
      });
    });

    it('srcUrl 优先于 selectionText 和 pageUrl', () => {
      const info = createMockOnClickData({
        srcUrl: 'https://example.com/image.png',
        selectionText: 'selected text',
        pageUrl: 'https://example.com',
      });

      const result = parseContextMenuClick('qrCode-image', info);

      expect(result).toEqual({
        success: true,
        data: { featureKey: 'qrCode', payload: 'https://example.com/image.png' },
      });
    });
  });
});
