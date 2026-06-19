import {
  isRestrictedUrl,
  isUnsupportedPageUrl,
  RESTRICTED_PROTOCOLS,
} from '@/utils/restrictedUrls';

describe('restrictedUrls', () => {
  describe('isRestrictedUrl', () => {
    it('应识别受限协议页面', () => {
      expect(isRestrictedUrl('chrome://settings')).toBe(true);
      expect(isRestrictedUrl('chrome-extension://abc123/background.html')).toBe(true);
      expect(isRestrictedUrl('about:blank')).toBe(true);
      expect(isRestrictedUrl('edge://settings')).toBe(true);
      expect(isRestrictedUrl('brave://settings')).toBe(true);
      expect(isRestrictedUrl('view-source:https://example.com')).toBe(true);
      expect(isRestrictedUrl('file:///path/to/file')).toBe(true);
      expect(isRestrictedUrl('data:text/html,<h1>Hello</h1>')).toBe(true);
    });

    it('应允许普通 http/https 页面', () => {
      expect(isRestrictedUrl('http://example.com')).toBe(false);
      expect(isRestrictedUrl('https://example.com')).toBe(false);
    });

    it('空 URL 应视为受限', () => {
      expect(isRestrictedUrl(undefined)).toBe(true);
      expect(isRestrictedUrl('')).toBe(true);
    });
  });

  describe('isUnsupportedPageUrl', () => {
    it('应通过 protocol 精确匹配识别受限页面', () => {
      expect(isUnsupportedPageUrl('chrome://newtab/')).toBe(true);
      expect(isUnsupportedPageUrl('brave://settings/')).toBe(true);
      expect(isUnsupportedPageUrl('https://example.com')).toBe(false);
    });

    it('无效 URL 应视为不支持', () => {
      expect(isUnsupportedPageUrl(undefined)).toBe(true);
      expect(isUnsupportedPageUrl('not-a-url')).toBe(true);
    });
  });

  it('RESTRICTED_PROTOCOLS 应包含 storage cleaner 与右键恢复所需协议', () => {
    expect(RESTRICTED_PROTOCOLS).toEqual(
      expect.arrayContaining(['brave:', 'view-source:', 'file:', 'data:']),
    );
  });
});
