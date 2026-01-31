import { useRef, useState, useCallback } from 'react';

export const useRecorder = () => {
  // 存储停止录制函数
  const stopFnRef = useRef<(() => void) | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const startRecord = useCallback(async () => {
    if (isRecording) return;

    try {
      // await chrome.runtime.sendMessage({ type: 'CREATE_OFFSCREEN' });
      setIsRecording(true);

      console.log('[content] rrweb started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
    }
  }, [isRecording]);

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
  };
};
