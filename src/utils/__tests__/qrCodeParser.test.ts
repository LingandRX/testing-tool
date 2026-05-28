import { describe, expect, it, vi } from 'vitest';
import { parseQrCodeFromFile } from '@/utils/qrCodeParser';
import QrScanner from 'qr-scanner';

// Mock qr-scanner
vi.mock('qr-scanner', () => ({
  default: {
    scanImage: vi.fn(),
  },
}));

describe('qrCodeParser', () => {
  describe('parseQrCodeFromFile', () => {
    it('应该成功解析二维码并返回数据', async () => {
      const mockResult = { data: 'https://example.com', cornerPoints: [] };
      (QrScanner.scanImage as any).mockResolvedValue(mockResult);

      const mockFile = new File(['mock-image-data'], 'qrcode.png', { type: 'image/png' });
      const result = await parseQrCodeFromFile(mockFile);

      expect(result.success).toBe(true);
      expect(result.data).toBe('https://example.com');
      expect(QrScanner.scanImage).toHaveBeenCalledWith(mockFile, {
        returnDetailedScanResult: true,
      });
    });

    it('当未检测到二维码时应返回错误', async () => {
      const mockResult = { data: '', cornerPoints: [] };
      (QrScanner.scanImage as any).mockResolvedValue(mockResult);

      const mockFile = new File(['mock-image-data'], 'no-qr.png', { type: 'image/png' });
      const result = await parseQrCodeFromFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe('未检测到二维码');
    });

    it('当 scanImage 返回 null 时应返回错误', async () => {
      (QrScanner.scanImage as any).mockResolvedValue(null);

      const mockFile = new File(['mock-image-data'], 'empty.png', { type: 'image/png' });
      const result = await parseQrCodeFromFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe('未检测到二维码');
    });

    it('当抛出 "No QR code found" 时应返回中文错误', async () => {
      (QrScanner.scanImage as any).mockRejectedValue('No QR code found');

      const mockFile = new File(['mock-image-data'], 'no-qr.png', { type: 'image/png' });
      const result = await parseQrCodeFromFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe('未检测到二维码');
    });

    it('当抛出 Error 实例时应返回错误消息', async () => {
      (QrScanner.scanImage as any).mockRejectedValue(new Error('Image format not supported'));

      const mockFile = new File(['mock-image-data'], 'bad.png', { type: 'image/png' });
      const result = await parseQrCodeFromFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Image format not supported');
    });

    it('当抛出非 Error 非字符串值时应正确转换', async () => {
      (QrScanner.scanImage as any).mockRejectedValue(12345);

      const mockFile = new File(['mock-image-data'], 'error.png', { type: 'image/png' });
      const result = await parseQrCodeFromFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe('12345');
    });

    it('当抛出对象时应正确转换为字符串', async () => {
      (QrScanner.scanImage as any).mockRejectedValue({ message: 'custom error' });

      const mockFile = new File(['mock-image-data'], 'error.png', { type: 'image/png' });
      const result = await parseQrCodeFromFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe('[object Object]');
    });

    it('应该处理包含中文内容的二维码', async () => {
      const mockResult = { data: 'https://example.com/中文路径', cornerPoints: [] };
      (QrScanner.scanImage as any).mockResolvedValue(mockResult);

      const mockFile = new File(['mock-image-data'], 'chinese.png', { type: 'image/png' });
      const result = await parseQrCodeFromFile(mockFile);

      expect(result.success).toBe(true);
      expect(result.data).toBe('https://example.com/中文路径');
    });

    it('应该处理纯文本二维码', async () => {
      const mockResult = { data: 'WIFI:T:WPA;S:MyNetwork;P:password;;', cornerPoints: [] };
      (QrScanner.scanImage as any).mockResolvedValue(mockResult);

      const mockFile = new File(['mock-image-data'], 'wifi.png', { type: 'image/png' });
      const result = await parseQrCodeFromFile(mockFile);

      expect(result.success).toBe(true);
      expect(result.data).toBe('WIFI:T:WPA;S:MyNetwork;P:password;;');
    });
  });
});
