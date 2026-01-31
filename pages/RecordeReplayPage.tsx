import { useEffect, useState } from 'react';

const RecordeReplayPage = () => {
  const [isRecording, setIsRecording] = useState(false);

  const getActiveTab = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  };

  useEffect(() => {
    const checkStatus = async () => {
      const tab = await getActiveTab();
      if (tab?.id) {
        try {
          // 发送一个检查状态的命令（需要在 content script 增加对应的处理）
          // 或者使用 storage 方案（推荐）
          // 这里假设你用 sendMessage 检查
          chrome.tabs.sendMessage(tab.id, { command: 'CHECK_STATUS' }, (response) => {
            // 如果 content script 没加载，这里会报错，需要 catch
            if (chrome.runtime.lastError) {
              console.log('Content script not ready');
              return;
            }
            if (response?.isRecording) {
              setIsRecording(true);
            }
          });
        } catch (e) {
          console.error(e);
        }
      }
    };
    checkStatus();
  }, []);

  const toggleRecording = async () => {
    const tab = await getActiveTab();
    if (!tab?.id) return;

    // 2. 无论开始还是停止，都重新获取当前的 Tab ID
    // 不要依赖 state 中的 tabId，因为 popup 关闭后 state 会丢
    const nextState = !isRecording;
    const command = nextState ? 'START_RECORD' : 'STOP_RECORD';

    chrome.tabs.sendMessage(tab.id, { type: command }, (response) => {
      // 处理 runtime.lastError 防止报错红字
      if (chrome.runtime.lastError) {
        console.error('通信失败:', chrome.runtime.lastError.message);
        alert('请刷新当前网页后再试（Content Script 未注入）');
        return;
      }

      console.log('Content回复:', response);
      if (response?.status) {
        // 只有收到确认回复后，才改变 UI 状态
        setIsRecording(nextState);
      }
    });
  };

  const test = async () => {
    await chrome.runtime.sendMessage({ type: 'test' }).then((response) => {
      console.log('[popup] Response from background:', response);
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className={`action-btn ${isRecording ? 'stop-btn' : ''}`} onClick={toggleRecording}>
          {isRecording ? '停止录制' : '开始录制'}
        </button>
        <button className="action-btn" onClick={test}>
          test
        </button>
      </div>
    </div>
  );
};

export default RecordeReplayPage;
