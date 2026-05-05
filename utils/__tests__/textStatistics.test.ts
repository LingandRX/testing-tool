import { describe, expect, it } from 'vitest';
import { formatByteSize, getTextStats } from '../textStatistics';

describe('textStatistics utils', () => {
  describe('getTextStats', () => {
    it('should return zeros for empty text', () => {
      const stats = getTextStats('');
      expect(stats).toEqual({ characters: 0, words: 0, lines: 0, bytes: 0 });
    });

    it('should count characters correctly', () => {
      expect(getTextStats('abc').characters).toBe(3);
      expect(getTextStats('a b c').characters).toBe(5);
      expect(getTextStats('你好').characters).toBe(2);
    });

    it('should count English words correctly', () => {
      expect(getTextStats('hello world').words).toBe(2);
      expect(getTextStats('  hello   world  ').words).toBe(2);
      expect(getTextStats('hello, world!').words).toBe(2);
    });

    it('should count Chinese words correctly', () => {
      // "你好世界" 在 Intl.Segmenter 中通常被识别为 "你好" 和 "世界" 两个词
      const stats = getTextStats('你好世界');
      expect(stats.words).toBe(2);
    });

    it('should count mixed language words correctly', () => {
      const stats = getTextStats('Hello 你好');
      // "Hello" (1) + "你好" (1) = 2
      expect(stats.words).toBe(2);
    });

    it('should count lines correctly', () => {
      expect(getTextStats('line1\nline2').lines).toBe(2);
      expect(getTextStats('line1\nline2\n').lines).toBe(3);
    });

    it('should count bytes correctly (UTF-8)', () => {
      expect(getTextStats('abc').bytes).toBe(3);
      expect(getTextStats('你好').bytes).toBe(6); // UTF-8 中每个常用汉字占 3 字节
    });

    it('should handle special cases', () => {
      expect(getTextStats('   ').words).toBe(0);
      expect(getTextStats('\n\n\n').lines).toBe(4);
      expect(getTextStats('\n\n\n').words).toBe(0);
    });
  });

  describe('formatByteSize', () => {
    it('should format bytes correctly', () => {
      expect(formatByteSize(100)).toBe('100 B');
      expect(formatByteSize(0)).toBe('0 B');
      expect(formatByteSize(1024)).toBe('1.0 KB');
      expect(formatByteSize(1024 * 1024)).toBe('1.00 MB');
    });
  });
});
