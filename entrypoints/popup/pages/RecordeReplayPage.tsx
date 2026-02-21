import { useEffect, useState, useMemo } from 'react';
import { AppState } from '../types';
import { sendMessage, onMessage } from '@/utils/messages';
import { Button, Container, Stack } from '@mui/material';

const RecordeReplayPage = () => {
  const [status, setStatus] = useState<AppState>(AppState.READ);
  const isRecording = useMemo(() => status === AppState.RECORDING, [status]);

  useEffect(() => {
    const unlistenStarted = onMessage('popup:started', () => {
      console.log('[popup] Received started message');
      setStatus(AppState.RECORDING);
    });

    const unlistenStopped = onMessage('popup:stopped', () => {
      setStatus(AppState.READ);
    });

    const unlistenReady = onMessage('popup:ready', () => {
      setStatus(AppState.READ);
    });

    sendMessage('popup:check-status', undefined)
      .then((res) => {
        if (res?.active) {
          setStatus(AppState.RECORDING);
        } else {
          setStatus(AppState.READ);
        }
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      unlistenStarted();
      unlistenStopped();
      unlistenReady();
    };
  }, []);

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        const result = await sendMessage('popup:stop', undefined);
        if (!result?.ok) {
          return;
        }
      } else {
        const result = await sendMessage('popup:start', undefined);
        if (!result?.ok) {
          return;
        }
      }
    } catch (error) {
      console.error('Error toggling recording:', error);
    }
  };

  return (
    <Container maxWidth={false} sx={{ py: 2.5 }}>
      <Stack direction="row" spacing={1.25} sx={{ mb: 2.5 }}>
        <Button
          variant="contained"
          size="medium"
          color={isRecording ? 'error' : 'primary'}
          onClick={toggleRecording}
        >
          {isRecording ? '停止录制' : '开始录制'}
        </Button>
      </Stack>
    </Container>
  );
};

export default RecordeReplayPage;
