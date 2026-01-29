import { useRef, useState } from 'react';
import { record } from 'rrweb';

export const useRecorder = () => {
  // 存储停止录制函数
  const stopFnRef = useRef();
  const [isRecording, setIsRecording] = useState(false);

  const startRecord = async () => {
    if (isRecording) return;

    await chrome.runtime.sendMessage({ type: 'CREATE_OFFSCREEN' });
    setIsRecording(true);

    // 启动录制
    stopFnRef.current = record({
      emit(event) {
        // 存储数据
        // eventRef.current.push(event);
        chrome.runtime.sendMessage({ type: 'SAVE_EVENT', event });
      },
    });

    console.log('[content] rrweb started');
  };

  const stopRecord = () => {
    if (!isRecording) return;

    setIsRecording(false);

    // 停止录制
    if (stopFnRef.current) {
      chrome.runtime.sendMessage({ type: 'SAVE_EVENTS' });
      stopFnRef.current?.();

      console.log('[content] rrweb stopped');
    }
  };

  return {
    startRecord,
    stopRecord,
    isRecording,
    getEvents: () => eventRef.current,
  };
};
