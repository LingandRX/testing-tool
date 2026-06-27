import QrScanner from 'qr-scanner';

interface QrCodeParseResult {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * 从文件中解析二维码
 */
export async function parseQrCodeFromFile(file: File): Promise<QrCodeParseResult> {
  try {
    const result = await QrScanner.scanImage(file, {
      returnDetailedScanResult: true,
    });

    if (result && result.data) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: '未检测到二维码' };
    }
  } catch (err) {
    const errorMsg =
      err === 'No QR code found'
        ? '未检测到二维码'
        : err instanceof Error
          ? err.message
          : String(err);
    return { success: false, error: errorMsg };
  }
}
