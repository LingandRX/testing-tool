import { describe, expect, it, vi, beforeAll } from 'vitest';
import { copyTextToClipboard, copyImageToClipboard } from '@/utils/clipboard';

// Mock ClipboardItem for test environment
class MockClipboardItem {
  constructor(public items: Record<string, Blob>) {}
}

beforeAll(() => {
  (globalThis as any).ClipboardItem = MockClipboardItem;
});

describe('clipboard', () => {
  describe('copyTextToClipboard', () => {
    it('复制成功时应返回 true', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      const result = await copyTextToClipboard('test text');

      expect(result).toBe(true);
      expect(writeText).toHaveBeenCalledWith('test text');
    });

    it('复制失败时应返回 false', async () => {
      const writeText = vi.fn().mockRejectedValue(new Error('Permission denied'));
      Object.assign(navigator, { clipboard: { writeText } });

      const result = await copyTextToClipboard('test text');

      expect(result).toBe(false);
    });
  });

  describe('copyImageToClipboard', () => {
    it('复制成功时应返回 true', async () => {
      const write = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { write } });

      const blob = new Blob(['png data'], { type: 'image/png' });
      const result = await copyImageToClipboard(blob);

      expect(result).toBe(true);
      expect(write).toHaveBeenCalledTimes(1);
    });

    it('复制失败时应返回 false', async () => {
      const write = vi.fn().mockRejectedValue(new Error('Permission denied'));
      Object.assign(navigator, { clipboard: { write } });

      const blob = new Blob(['png data'], { type: 'image/png' });
      const result = await copyImageToClipboard(blob);

      expect(result).toBe(false);
    });
  });
});
