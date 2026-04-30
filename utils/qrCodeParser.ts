import jsQR from 'jsqr';

export interface QrCodeParseResult {
  success: boolean;
  data?: string;
  error?: string;
}

export async function parseQrCodeFromFile(
  file: File,
  timeout: number = 10000,
): Promise<QrCodeParseResult> {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return { success: false, error: '无法创建 canvas 上下文' };
    }

    const image = new Image();
    image.src = URL.createObjectURL(file);

    await new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('图片加载超时'));
      }, timeout);

      image.onload = () => {
        clearTimeout(timeoutId);
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);
        resolve();
      };

      image.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('图片加载失败'));
      };
    });

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      return { success: true, data: code.data };
    } else {
      return { success: false, error: '未检测到二维码' };
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '解析失败' };
  }
}
