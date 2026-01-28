import { useEffect, useState, useCallback } from 'react';

const CopyButton = ({
  text = '要复制的文本',
  buttonText = '复制文本',
  className = 'action-btn',
  successMessage = '复制成功！',
  errorMessage = '复制失败，请手动复制。',
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

  const performCopy = async () => {
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
  };

  const handleClick = useCallback(async () => {
    setStatus('copying');

    try {
      const isSuccess = await performCopy();
      setStatus(isSuccess ? 'success' : 'error');
    } catch (error) {
      console.error('复制时出错:', error);
      setStatus('error');
    }
  }, [text]);

  // 根据状态计算当前显示的文本
  const currentText =
    status === 'success' ? successMessage : status === 'error' ? errorMessage : buttonText;

  // 动态样式：只在非默认状态下覆盖颜色，平时让 className 控制
  const getStyle = () => {
    const baseStyle = {
      transition: 'all 0.3s ease',
      cursor: 'pointer', // 确保有手型光标
      // 这里去掉了 padding/border/radius 的硬编码，建议在 CSS 类中定义
      // 除非你想强制覆盖
    };

    if (status === 'success') {
      return { ...baseStyle, backgroundColor: '#4CAF50', color: 'white' };
    }
    if (status === 'error') {
      return { ...baseStyle, backgroundColor: '#f44336', color: 'white' };
    }

    return baseStyle;
  };

  return (
    <button
      onClick={handleClick}
      className={`${className} ${status} copy-button`}
      style={getStyle()}
      disabled={status === 'copying'}
    >
      {currentText}
    </button>
  );
};

export default CopyButton;
