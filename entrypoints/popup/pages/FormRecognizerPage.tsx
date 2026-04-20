import { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  Paper,
  CircularProgress,
  Stack,
  Switch,
  FormControlLabel,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import GlobalSnackbar, { useSnackbar } from '@/components/GlobalSnackbar';
import { dashboardPageStyles } from '@/config/pageTheme';

const FormRecognizerPage = () => {
  const { snackbarProps, showMessage } = useSnackbar({ autoHideDuration: 1500 });
  const [loading, setLoading] = useState(false);
  const [includeHidden, setIncludeHidden] = useState(false);

  interface MessagePayload {
    includeHidden?: boolean;
  }

  const sendMessageToContent = async (action: string, payload?: MessagePayload) => {
    setLoading(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) {
        showMessage('无法获取当前标签页', { severity: 'error' });
        return;
      }

      const response = await chrome.tabs.sendMessage(tab.id, { action, ...payload });
      if (response.success) {
        showMessage(response.message, { severity: 'success' });
      } else {
        showMessage(response.message, { severity: 'error' });
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      showMessage('请确保当前页面已加载完成', { severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFillValidData = () => {
    sendMessageToContent('fillValidData', { includeHidden });
  };

  const handleFillInvalidData = () => {
    sendMessageToContent('fillInvalidData', { includeHidden });
  };

  const handleClearAllFields = () => {
    sendMessageToContent('clearAllFields');
  };

  return (
    <Box sx={{ bgcolor: dashboardPageStyles.backgroundColor, minHeight: '100%', pb: 4 }}>
      <Container maxWidth="sm" sx={{ py: 3, px: 2, bgcolor: '#f5f5f5' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            Dummy Data Generator
          </Typography>
          <Typography variant="body2" color="text.secondary">
            一键填充表单测试数据，提升开发和测试效率
          </Typography>
        </Box>

        {/* 主要操作按钮 */}
        <Stack spacing={2} sx={{ mb: 4 }}>
          <Button
            variant="contained"
            startIcon={
              loading ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />
            }
            onClick={handleFillValidData}
            disabled={loading}
            fullWidth
            sx={{
              py: 1.2,
              borderRadius: 3,
              bgcolor: '#4caf50',
              fontWeight: 700,
              '&:hover': {
                bgcolor: '#388e3c',
              },
            }}
          >
            {loading ? '填充中...' : '一键填充（有效数据）'}
          </Button>

          <Button
            variant="contained"
            startIcon={
              loading ? <CircularProgress size={16} color="inherit" /> : <ErrorOutlineIcon />
            }
            onClick={handleFillInvalidData}
            disabled={loading}
            fullWidth
            sx={{
              py: 1.2,
              borderRadius: 3,
              bgcolor: '#ff9800',
              fontWeight: 700,
              '&:hover': {
                bgcolor: '#f57c00',
              },
            }}
          >
            {loading ? '填充中...' : '一键填充（异常数据）'}
          </Button>

          <Button
            variant="outlined"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ClearAllIcon />}
            onClick={handleClearAllFields}
            disabled={loading}
            fullWidth
            sx={{
              py: 1.2,
              borderRadius: 3,
              borderColor: '#f44336',
              color: '#f44336',
              fontWeight: 700,
              '&:hover': {
                borderColor: '#d32f2f',
                bgcolor: 'rgba(244, 67, 54, 0.05)',
              },
            }}
          >
            {loading ? '清空ing...' : '一键清空所有表单'}
          </Button>
        </Stack>

        {/* 选项设置 */}
        <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              填充选项
            </Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={includeHidden}
                  onChange={(e) => setIncludeHidden(e.target.checked)}
                  color="primary"
                />
              }
              label="包含隐藏字段"
              sx={{ width: '100%' }}
            />
          </Box>
        </Paper>

        {/* 功能说明 */}
        <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              功能说明
            </Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>有效数据模式：</strong>生成符合格式要求的测试数据，适用于正常功能测试。
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>异常数据模式：</strong>生成边界值或格式错误的数据，适用于异常场景测试。
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>一键清空：</strong>快速清空当前页面所有表单字段的值。
            </Typography>
            <Typography variant="body2">
              <strong>支持的字段类型：</strong>
              文本、邮箱、手机号、数字、日期、文本域、密码、身份证号等。
            </Typography>
          </Box>
        </Paper>

        <GlobalSnackbar {...snackbarProps} />
      </Container>
    </Box>
  );
};

export default FormRecognizerPage;
