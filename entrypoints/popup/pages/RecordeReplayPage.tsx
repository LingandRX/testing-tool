import { useEffect, useState } from 'react';
import { AppState } from '../types';
import { messages } from '../../../utils/messages';

const RecordeReplayPage = () => {
  const [status, setStatus] = useState<AppState>(AppState.READ);
  const [isRecording, setIsRecording] = useState(false);

  const getActiveTab = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  };

  useEffect(() => {
    const handleMessage = (msg: { type: string }) => {
      if (msg.type === messages.popup.ready) {
        setStatus(AppState.READ);
      } else if (msg.type === messages.popup.to.started) {
        setStatus(AppState.RECORDING);
      } else if (msg.type === messages.popup.to.stoped) {
        setStatus(AppState.READ);
      }
    };

    browser.runtime.onMessage.addListener(handleMessage);

    browser.runtime.sendMessage({ type: messages.popup.checkStatus });

    return () => browser.runtime.onMessage.removeListener(handleMessage);
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
      const tab = await getActiveTab();
      if (tab?.id) {
        try {
          chrome.tabs.sendMessage(tab.id, { command: 'CHECK_STATUS' }, (response) => {
            // 如果 content script 没加载，这里会报错，需要 catch
            if (chrome.runtime.lastError) {
              console.log('Content script not ready');
              return;
            }
            if (response?.isRecording) {
              setIsRecording(true);
              setStatus(AppState.RECORDING);
              console.log(status);
            }
          });
        } catch (e) {
          console.error(e);
        }
      }
    };
    checkStatus();
  }, [status]);

  const toggleRecording = async () => {
    const tab = await getActiveTab();
    if (!tab?.id) return;
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className={`action-btn ${isRecording ? 'stop-btn' : ''}`} onClick={toggleRecording}>
          {isRecording ? '停止录制' : '开始录制'}
        </button>
      </div>
    </div>
  );
};

export default RecordeReplayPage;
