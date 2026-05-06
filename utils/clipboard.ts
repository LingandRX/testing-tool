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
      .catch((error) => {
        reject(new Error(`复制文本到剪贴板失败，错误: ${error?.message || 'Unknown error'}`));
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
      .catch((error) => {
        reject(new Error(`复制图片到剪贴板失败，错误: ${error?.message || 'Unknown error'}`));
      });
  });
};
