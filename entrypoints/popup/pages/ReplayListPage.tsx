import { useEffect, useState } from 'react';
import {
  Container,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { sendMessage } from '@/utils/messages';

interface Session {
  id: string;
  startTime: number;
  tabId: number;
  chunkCount: number;
  totalEvents: number;
}

const ReplayListPage = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await sendMessage('popup:get-sessions');
      setSessions(data || []);
    } catch (err) {
      console.error(err);
      setError('获取录制历史失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = (sessionId: string) => {
    navigate(`/replay/${sessionId}`);
  };

  const handleDownload = async (sessionId: string) => {
    try {
      await sendMessage('popup:download-session', sessionId);
    } catch (err) {
      console.error(err);
      setError('下载失败');
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (window.confirm('确定要删除这个录制吗？')) {
      try {
        await sendMessage('popup:delete-session', sessionId);
        fetchSessions();
      } catch (err) {
        console.error(err);
        setError('删除失败');
      }
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth={false} sx={{ py: 2.5, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth={false} sx={{ py: 2.5 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchSessions}>
          重试
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 2.5 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        录制历史
      </Typography>

      {sessions.length === 0 ? (
        <Box textAlign="center" sx={{ py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            暂无录制历史
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            点击"录制与回放"页面的开始按钮进行录制
          </Typography>
        </Box>
      ) : (
        <List sx={{ width: '100%', maxWidth: 500, margin: '0 auto' }}>
          {sessions.map((session) => (
            <ListItem
              key={session.id}
              disablePadding
              sx={{ mb: 1, borderRadius: 1, overflow: 'hidden' }}
            >
              <ListItemButton
                sx={{ borderRadius: 1 }}
                onClick={() => handlePlay(session.id)}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PlayIcon fontSize="small" />
                      <Typography variant="body1">
                        {new Date(session.startTime).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        事件数: {session.chunkCount * 100}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Tab: {session.tabId}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(session.id);
                    }}
                    title="下载"
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(session.id);
                    }}
                    title="删除"
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
};

export default ReplayListPage;
