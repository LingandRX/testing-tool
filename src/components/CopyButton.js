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
      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({
          action: 'copy',
          text: text
        }, (response) => {
          if (response && response.success) {
            handleCopySuccess();
          } else {
            handleCopyError();
          }
        });
      } else {
        await navigator.clipboard.writeText(text.toString());
        handleCopySuccess();
      }
    } catch (err) {
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
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      {btnText}
    </button>
  );
};

export default CopyButton;