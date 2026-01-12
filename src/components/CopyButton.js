import {useState, useCallback} from "react";

const CopyButton = ({
                      text = '要复制的文本',
                      buttonText = '复制文本',
                      className = 'action-btn',
                    }) => {
  const [btnText, setBtnText] = useState(buttonText);
  const [copyStatus, setCopyStatus] = useState('');
  
  // 重置按钮状态的函数
  const resetButton = useCallback(() => {
    setBtnText(buttonText);
    setCopyStatus('');
  }, [buttonText]);
  
  // 复制成功的处理
  const handleCopySuccess = useCallback(() => {
    setCopyStatus('success');
    
    // 2秒后恢复
    setTimeout(() => {
      resetButton();
    }, 2000);
  }, [text, resetButton]);
  
  // 复制失败的处理
  const handleCopyError = useCallback(() => {
    setCopyStatus('error');
    
    // 2秒后恢复
    setTimeout(() => {
      resetButton();
    }, 2000);
  }, [resetButton]);
  
  const handleCopy = async () => {
    try {
      console.log('开始复制:', text);

      // 首先尝试直接使用navigator.clipboard（在popup页面中可能可用）
      try {
        console.log('尝试直接使用navigator.clipboard复制');
        await navigator.clipboard.writeText(text.toString());
        console.log('直接复制成功');
        handleCopySuccess();
        return;
      } catch (directError) {
        console.log('直接复制失败，尝试使用Chrome扩展API:', directError);
      }

      // 如果直接复制失败，尝试使用Chrome扩展API
      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        console.log('使用Chrome扩展API复制');

        // 使用Chrome扩展API复制
        chrome.runtime.sendMessage({
          action: 'copy',
          text: text
        }, (response) => {
          console.log('收到background响应:', response, 'lastError:', chrome.runtime.lastError);

          // 检查是否有运行时错误
          if (chrome.runtime.lastError) {
            console.error('Chrome运行时错误:', chrome.runtime.lastError.message);
            handleCopyError();
            return;
          }

          // 检查响应
          if (response && response.success) {
            console.log('通过background复制成功');
            handleCopySuccess();
          } else {
            console.error('通过background复制失败:', response?.error);
            handleCopyError();
          }
        });
      } else {
        console.error('没有可用的复制方法');
        handleCopyError();
      }
    } catch (err) {
      console.error('复制过程中发生错误:', err);
      handleCopyError();
    }
  };
  
  return (
    <button
      onClick={handleCopy}
      className={className}
      style={{
        backgroundColor: copyStatus === 'success' ? '#4CAF50' :
          copyStatus === 'error' ? '#f44336' : '',
        color: copyStatus ? 'white' : '',
        transition: 'all 0.3s ease',
        padding: '8px 16px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer'
      }}
    >
      {btnText}
    </button>
  );
};

export default CopyButton;