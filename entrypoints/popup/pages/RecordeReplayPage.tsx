import { useEffect, useState, useMemo } from 'react';
import { AppState } from '../types';
import { messages } from '@/utils/messages';
import { Button } from '@mui/material';

const RecordeReplayPage = () => {
  const [status, setStatus] = useState<AppState>(AppState.READ);
  const isRecording = useMemo(() => status === AppState.RECORDING, [status]);

  useEffect(() => {
    const handleMessage = (msg: { type: string }) => {
      if (msg.type === messages.popup.ready) {
        setStatus(AppState.READ);
      }

      if (msg.type === messages.popup.to.started) {
        console.log('[popup] Received started message');
        setStatus(AppState.RECORDING);
      }

      if (msg.type === messages.popup.to.stopped) {
        setStatus(AppState.READ);
      }
    };

    browser.runtime.onMessage.addListener(handleMessage);

    browser.runtime
      .sendMessage({ type: messages.popup.checkStatus })
      .then((res) => {
        if (res?.data?.isRecording) {
          setStatus(AppState.RECORDING);
        } else {
          setStatus(AppState.READ);
        }
      })
      .catch((err) => {
        console.error(err);
      });

    return () => browser.runtime.onMessage.removeListener(handleMessage);
  }, []);

  const toggleRecording = async () => {
    try {
      const actionType = isRecording ? messages.popup.from.stop : messages.popup.from.start;
      await browser.runtime.sendMessage({ type: actionType });
    } catch (error) {
      console.error('Error toggling recording:', error);
      setStatus(AppState.READ);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <Button
          variant="contained"
          size="medium"
          color={isRecording ? 'error' : 'primary'}
          onClick={toggleRecording}
        >
          {isRecording ? '停止录制' : '开始录制'}
        </Button>
      </div>
    </div>
  );
};

export default RecordeReplayPage;
