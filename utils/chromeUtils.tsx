/**
 * 使用Chrome扩展API复制文本到剪贴板
 * @param text 复制文本
 * @returns
 *  - false: 复制失败
 *  - true: 复制成功
 */
export const copyToClipboard = async (text: string) => {
  console.log('尝试复制文本:', text);
  if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
    console.log('使用Chrome扩展API复制');
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          action: 'copy',
          text: text,
        },
        (response) => {
          console.log('收到background响应:', response, 'lastError:', chrome.runtime.lastError);

          // 检查是否有运行时错误
          if (chrome.runtime.lastError) {
            console.error('Chrome运行时错误:', chrome.runtime.lastError.message);
            return reject(false);
          }

          // 检查响应
          if (response && response.success) {
            console.log('通过background复制成功');
            return resolve(true);
          } else {
            console.error('通过background复制失败:', response?.error);
            return reject(false);
          }
        }
      );
    });
  }

  return Promise.reject(false);
};
