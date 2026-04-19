import { describe, it, expect } from 'vitest';
import {
  isRestrictedUrl,
  formatSize,
} from '../storageCleaner';

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
      expect(formatSize(1024)).toBe('1 KB');
      expect(formatSize(1536)).toBe('1.5 KB');
      expect(formatSize(2048)).toBe('2 KB');
    });

    it('should format megabytes correctly', () => {
      expect(formatSize(1048576)).toBe('1 MB');
      expect(formatSize(1572864)).toBe('1.5 MB');
      expect(formatSize(5242880)).toBe('5 MB');
    });

    it('should format gigabytes correctly', () => {
      expect(formatSize(1073741824)).toBe('1 GB');
      expect(formatSize(2147483648)).toBe('2 GB');
    });

    it('should handle edge cases', () => {
      expect(formatSize(1)).toBe('1 B');
      expect(formatSize(1023)).toBe('1023 B');
      expect(formatSize(1025)).toBe('1 KB');
    });
  });
});