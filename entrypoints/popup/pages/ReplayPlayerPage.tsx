import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Button,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { sendMessage } from '@/utils/messages';

const ReplayPlayerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventsData, setEventsData] = useState<unknown[] | null>(null);

  const fetchSessionEvents = useCallback(async (sessionId: string) => {
    try {
      const data = await sendMessage('popup:get-session-events', sessionId);
      setEventsData(data || []);
    } catch (err) {
      console.error(err);
      setError('加载录制内容失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchSessionEvents(id);
    }
  }, [id, fetchSessionEvents]);

  const handleDownload = async () => {
    if (!id) return;
    try {
      await sendMessage('popup:download-session', id);
    } catch (err) {
      console.error(err);
      setError('下载失败');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm('确定要删除这个录制吗？')) {
      try {
        await sendMessage('popup:delete-session', id);
        navigate('/record-replay');
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/record-replay')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">回放</Typography>
        </Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => fetchSessionEvents(id!)}>
          重试
        </Button>
      </Container>
    );
  }

  if (!eventsData || eventsData.length === 0) {
    return (
      <Container maxWidth={false} sx={{ py: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/record-replay')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">回放</Typography>
        </Box>
        <Alert severity="warning">
          此会话没有事件数据，请尝试重新录制。
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate('/record-replay')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">回放</Typography>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <IconButton onClick={handleDownload} title="下载">
            <DownloadIcon />
          </IconButton>
          <IconButton onClick={handleDelete} title="删除" sx={{ color: 'error.main' }}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ borderRadius: 1, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            由于浏览器安全策略限制，无法在内联 iframe 中直接回放。
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            请点击右上角的"下载"按钮，下载完整的回放 HTML 文件到本地查看。
          </Typography>
          <Button
            variant="contained"
            onClick={handleDownload}
            sx={{ mt: 2 }}
            startIcon={<DownloadIcon />}
          >
            下载回放文件
          </Button>
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>安全提示：</strong>浏览器扩展有严格的 Content Security Policy (CSP)
            限制，禁止内联脚本执行，因此无法在扩展 popup 中直接显示回放内容。
            下载的 HTML 文件包含了完整的回放代码，可以在任何现代浏览器中直接打开。
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
};

export default ReplayPlayerPage;
