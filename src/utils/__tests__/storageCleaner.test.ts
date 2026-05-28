import { describe, expect, it } from 'vitest';
import { clearCookies, formatSize, isRestrictedUrl } from '@/utils/storageCleaner';

describe('storageCleaner utils', () => {
  describe('isRestrictedUrl', () => {
    it('should return true for chrome:// URLs', () => {
      expect(isRestrictedUrl('chrome://settings')).toBe(true);
    });

    it('should return true for chrome-extension:// URLs', () => {
      expect(isRestrictedUrl('chrome-extension://abc123/background.html')).toBe(true);
    });

    it('should return true for about:// URLs', () => {
      expect(isRestrictedUrl('about:blank')).toBe(true);
    });

    it('should return true for edge:// URLs', () => {
      expect(isRestrictedUrl('edge://settings')).toBe(true);
    });

    it('should return true for view-source:// URLs', () => {
      expect(isRestrictedUrl('view-source:https://example.com')).toBe(true);
    });

    it('should return true for file:// URLs', () => {
      expect(isRestrictedUrl('file:///path/to/file')).toBe(true);
    });

    it('should return true for data:// URLs', () => {
      expect(isRestrictedUrl('data:text/html,<h1>Hello</h1>')).toBe(true);
    });

    it('should return false for http:// URLs', () => {
      expect(isRestrictedUrl('http://example.com')).toBe(false);
    });

    it('should return false for https:// URLs', () => {
      expect(isRestrictedUrl('https://example.com')).toBe(false);
    });

    it('should return true for undefined URL', () => {
      expect(isRestrictedUrl(undefined)).toBe(true);
    });

    it('should return true for empty string', () => {
      expect(isRestrictedUrl('')).toBe(true);
    });
  });

  describe('formatSize', () => {
    it('should return "0 B" for 0 bytes', () => {
      expect(formatSize(0)).toBe('0 B');
    });

    it('should format bytes correctly', () => {
      expect(formatSize(500)).toBe('500 B');
    });

    it('should format kilobytes correctly', () => {
      expect(formatSize(1024)).toBe('1.0 KB');
      expect(formatSize(1536)).toBe('1.5 KB');
      expect(formatSize(2048)).toBe('2.0 KB');
    });

    it('should format megabytes correctly', () => {
      expect(formatSize(1048576)).toBe('1.00 MB');
      expect(formatSize(1572864)).toBe('1.50 MB');
      expect(formatSize(5242880)).toBe('5.00 MB');
    });

    it('should format gigabytes correctly', () => {
      expect(formatSize(1073741824)).toBe('1.00 GB');
      expect(formatSize(2147483648)).toBe('2.00 GB');
    });

    it('should handle edge cases', () => {
      expect(formatSize(1)).toBe('1 B');
      expect(formatSize(1023)).toBe('1023 B');
      expect(formatSize(1025)).toBe('1.0 KB');
    });
  });

  describe('clearCookies', () => {
    it('should strip leading dot from cookie domain when removing cookies', async () => {
      const mockCookies = [
        { name: 'session', domain: '.example.com', path: '/', secure: true, storeId: '0' },
        { name: 'auth', domain: '.example.com', path: '/api', secure: false, storeId: '0' },
      ];
      (chrome.cookies.getAll as any).mockResolvedValue(mockCookies);
      (chrome.cookies.remove as any).mockResolvedValue(undefined);

      const result = await clearCookies('https://example.com');

      expect(result).toEqual({ success: true, count: 2 });
      expect(chrome.cookies.remove).toHaveBeenCalledWith({
        url: 'https://example.com/',
        name: 'session',
        storeId: '0',
      });
      expect(chrome.cookies.remove).toHaveBeenCalledWith({
        url: 'http://example.com/api',
        name: 'auth',
        storeId: '0',
      });
    });

    it('should handle domains without leading dot', async () => {
      const mockCookies = [
        { name: 'pref', domain: 'sub.example.com', path: '/path', secure: true, storeId: '0' },
      ];
      (chrome.cookies.getAll as any).mockResolvedValue(mockCookies);
      (chrome.cookies.remove as any).mockResolvedValue(undefined);

      const result = await clearCookies('https://sub.example.com');

      expect(result).toEqual({ success: true, count: 1 });
      expect(chrome.cookies.remove).toHaveBeenCalledWith({
        url: 'https://sub.example.com/path',
        name: 'pref',
        storeId: '0',
      });
    });

    it('should return error when operation fails', async () => {
      (chrome.cookies.getAll as any).mockRejectedValue(new Error('Permission denied'));

      const result = await clearCookies('https://example.com');

      expect(result).toEqual({ success: false, error: 'Error: Permission denied' });
    });
  });
});
