import { useEffect, useState, useMemo } from 'react';
import { AppState } from '../types';
import { sendMessage, onMessage } from '@/utils/messages';
import { Button, Container, Stack, Typography, Alert } from '@mui/material';
import { CircularProgress } from '@mui/material';

const RecordReplayPage = () => {
  const [status, setStatus] = useState<AppState>(AppState.READ);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isRecording = useMemo(() => status === AppState.RECORDING, [status]);

  useEffect(() => {
    const unlistenStarted = onMessage('popup:started', () => {
      console.log('[popup] Received started message');
      setStatus(AppState.RECORDING);
      setIsLoading(false);
      setError(null);
    });

    const unlistenStopped = onMessage('popup:stopped', () => {
      setStatus(AppState.READ);
      setIsLoading(false);
      setError(null);
    });

    const unlistenReady = onMessage('popup:ready', () => {
      setStatus(AppState.READ);
      setIsLoading(false);
      setError(null);
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
        setError('检查录制状态失败');
      });

    return () => {
      unlistenStarted();
      unlistenStopped();
      unlistenReady();
    };
  }, []);

  const toggleRecording = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isRecording) {
        const result = await sendMessage('popup:stop', undefined);
        if (!result?.ok) {
          setError(result?.error || '停止录制失败');
          setIsLoading(false);
          return;
        }
      } else {
        const result = await sendMessage('popup:start', undefined);
        if (!result?.ok) {
          setError(result?.error || '开始录制失败');
          setIsLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error('Error toggling recording:', error);
      setError('操作失败，请重试');
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth={false} sx={{ py: 2.5 }}>
      <Stack direction="column" spacing={2} sx={{ mb: 2.5 }}>
        {error && (
          <Alert severity="error" sx={{ fontSize: '0.875rem' }}>
            {error}
          </Alert>
        )}

        <Stack direction="row" spacing={1.25} justifyContent="center">
          <Button
            variant="contained"
            size="medium"
            color={isRecording ? 'error' : 'primary'}
            onClick={toggleRecording}
            disabled={isLoading}
            sx={{ minWidth: 120 }}
          >
            {isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : isRecording ? (
              '停止录制'
            ) : (
              '开始录制'
            )}
          </Button>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ mt: 1 }}
        >
          {isRecording ? '正在录制用户操作...' : '点击开始录制用户操作'}
        </Typography>
      </Stack>
    </Container>
  );
};

export default RecordReplayPage;
