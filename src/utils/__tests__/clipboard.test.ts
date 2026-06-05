import { describe, expect, it, vi } from 'vitest';
import { copyTextToClipboard } from '@/utils/clipboard';

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
});
