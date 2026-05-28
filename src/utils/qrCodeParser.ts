import QrScanner from 'qr-scanner';

export interface QrCodeParseResult {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * 从文件中解析二维码
 * 使用 qr-scanner 替代 jsqr 以减小体积并提高性能
 */
export async function parseQrCodeFromFile(file: File): Promise<QrCodeParseResult> {
  try {
    // qr-scanner 的 scanImage 方法支持直接传入 File 对象
    // 它会自动处理图片加载、Canvas 绘制和解析过程
    // 并且在支持的浏览器中会优先使用原生的 BarcodeDetector API
    const result = await QrScanner.scanImage(file, {
      returnDetailedScanResult: true,
    });

    if (result && result.data) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: '未检测到二维码' };
    }
  } catch (err) {
    // qr-scanner 在未发现二维码时会抛出 "No QR code found"
    const errorMsg =
      err === 'No QR code found'
        ? '未检测到二维码'
        : err instanceof Error
          ? err.message
          : String(err);
    return { success: false, error: errorMsg };
  }
}
