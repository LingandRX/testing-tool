import { useState, useCallback } from 'react';
import { copyToClipboard } from '@/utils/chromeUtils';

const CopyButton = ({
  text = '要复制的文本',
  buttonText = '复制文本',
  className = 'action-btn',
  successMessage = '复制成功！',
  errorMessage = '复制失败，请手动复制。',
  onCopyOverride = null,
}) => {
  const [status, setStatus] = useState('idle'); // 'idle' | 'copying' | 'success' | 'error'

  useEffect(() => {
    let timer;
    if (status === 'success' || status === 'error') {
      timer = setTimeout(() => {
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

    // 优先使用传入的复制函数
    if (onCopyOverride) {
      return await onCopyOverride(safeText);
    }

    const textArea = document.createElement("textarea");
    textArea.value = safeText;
    
    // 确保元素存在但不可见，且不影响布局
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    textArea.style.opacity = "0";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    // 使用通用的复制函数
    return true;
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
  }, [text, onCopyOverride]);

  // 根据状态计算当前显示的文本
  const currentText = status === 'success' ? successMessage 
                    : status === 'error' ? errorMessage 
                    : buttonText;

  // 根据状态计算样式 (建议使用 CSS Module 或 Tailwind，这里为了演示保留内联)
  const getBackgroundColor = () => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'error': return '#f44336';
      default: return '#4CAF50'; // 让 CSS 类控制默认颜色
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`${className} ${status} copy-button`}
      style={{
        backgroundColor: getBackgroundColor(),
        color: status !== 'idle' ? 'white' : undefined,
        transition: 'all 0.3s ease',
        padding: '8px 16px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
      }}
    >
      {currentText}
    </button>
  );
};

export default CopyButton;
