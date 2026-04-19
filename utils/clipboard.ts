import { useSnackbar } from '@/components/GlobalSnackbar';

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @param showMessage 显示消息的函数
 * @returns Promise<boolean> 是否复制成功
 */
export const copyToClipboard = async (
  text: string,
  showMessage?: (message: string, options?: { severity: 'success' | 'error' }) => void,
): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    showMessage?.('已复制', { severity: 'success' });
    return true;
  } catch (error) {
    console.error('复制失败:', error);
    showMessage?.('复制失败', { severity: 'error' });
    return false;
  }
};

/**
 * 自定义 Hook: 用于处理剪贴板操作
 * @returns 包含复制函数和 snackbarProps 的对象
 */
export const useClipboard = () => {
  const { snackbarProps, showMessage } = useSnackbar({ autoHideDuration: 1500 });

  const copy = async (text: string): Promise<boolean> => {
    return copyToClipboard(text, showMessage);
  };

  return { copy, snackbarProps };
};
