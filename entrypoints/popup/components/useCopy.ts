import { useState, useCallback } from 'react';
import { useSnackbar } from 'notistack'; // 1. 引入 hook

export const useCopy = (resetInterval = 2000) => {
  const [isCopied, setIsCopied] = useState(false);
  const { enqueueSnackbar } = useSnackbar(); // 2. 获取触发函数

  const copy = useCallback(
    async (text: string | number) => {
      if (!text) {
        enqueueSnackbar('没有可复制的内容', { variant: 'warning' });
        return false;
      }

      try {
        await navigator.clipboard.writeText(String(text));
        setIsCopied(true);

        // 3. 触发成功通知
        enqueueSnackbar('复制成功！', { variant: 'success' });

        // 自动重置状态
        setTimeout(() => setIsCopied(false), resetInterval);
        return true;
      } catch (error) {
        console.error('Copy failed:', error);

        // 4. 触发错误通知
        enqueueSnackbar('复制失败，请手动复制', { variant: 'error' });

        setIsCopied(false);
        return false;
      }
    },
    [enqueueSnackbar, resetInterval],
  );

  return { isCopied, copy };
};
