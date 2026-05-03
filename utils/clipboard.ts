/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise<boolean> 是否复制成功
 */
export const copyTextToClipboard = async (text: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        reject(false);
      });
  });
};

/**
 * 复制图片到剪贴板
 * @param blob 要复制的图片
 * @returns Promise<boolean> 是否复制成功
 */
export const copyImageToClipboard = async (blob: Blob): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    navigator.clipboard
      .write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ])
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        reject(false);
      });
  });
};
