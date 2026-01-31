import { useEffect, useState, useCallback } from 'react';

const CopyButton = ({
  text = '要复制的文本',
  buttonText = '复制文本',
  className = 'action-btn',
  successMessage = '复制成功！',
  errorMessage = '复制失败，请手动复制。',
  copyingMessage = '复制中...',
}) => {
  const [status, setStatus] = useState('idle'); // 'idle' | 'copying' | 'success' | 'error'

  useEffect(() => {
    let timer: number;
    if (status === 'success' || status === 'error') {
      timer = window.setTimeout(() => {
        setStatus('idle');
      }, 2000);
    }

    return () => clearTimeout(timer);
  }, [status]);

  const performCopy = useCallback(async () => {
    if (!text) {
      console.warn('没有提供要复制的文本');
      return false;
    }

    const safeText = String(text);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(safeText);
        return true;
      } catch (err) {
        console.error('使用 Clipboard API 复制失败:', err);
        return false;
      }
    }

    return false;
  }, [text]);

  const handleClick = useCallback(async () => {
    setStatus('copying');

    try {
      const isSuccess = await performCopy();
      setStatus(isSuccess ? 'success' : 'error');
    } catch (error) {
      console.error('复制时出错:', error);
      setStatus('error');
    }
  }, [performCopy]);

  // 根据状态计算当前显示的文本
  const currentText =
    status === 'success'
      ? successMessage
      : status === 'error'
        ? errorMessage
        : status === 'copying'
          ? copyingMessage
          : buttonText;

  // 动态样式：只在非默认状态下覆盖颜色，平时让 className 控制
  const getStyle = () => {
    if (status === 'success') {
      return { backgroundColor: '#4CAF50', color: 'white' };
    }
    if (status === 'error') {
      return { backgroundColor: '#f44336', color: 'white' };
    }

    return {};
  };

  return (
    <button
      onClick={handleClick}
      className={`${className} ${status} copy-button`}
      style={getStyle()}
      disabled={status === 'success' || status === 'copying'}
    >
      {currentText}
    </button>
  );
};

export default CopyButton;
