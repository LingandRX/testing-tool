import { useState, useRef } from 'react';
import { Box, Typography, Container, Button, CircularProgress } from '@mui/material';
import InputIcon from '@mui/icons-material/Input';
import GlobalSnackbar, { useSnackbar } from '@/components/GlobalSnackbar';
import { dashboardPageStyles, formRecognizerPageStyles } from '@/config/pageTheme';
import { MessageAction, sendMessageToContent, injectContentScript } from '@/utils/messages';
import FieldList from '@/components/FieldList';
import MainActions from '@/components/MainActions';
import OptionsPanel from '@/components/OptionsPanel';

// 字段数据接口
interface FieldData {
  id: string;
  fieldType: string;
  label: string | null;
  placeholder: string;
  name: string;
  value: string;
  isSelected: boolean;
  generatedValue: string;
}

const FormRecognizerPage = () => {
  const { snackbarProps, showMessage } = useSnackbar({ autoHideDuration: 1500 });
  const [loading, setLoading] = useState(false);
  const [includeHidden, setIncludeHidden] = useState(false);
  const isProcessingRef = useRef(false);
  const [fields, setFields] = useState<FieldData[]>([]);
  const [scanning, setScanning] = useState(false);
  const [showFields, setShowFields] = useState(false);

  // 扫描表单字段
  const handleScanFields = async () => {
    setScanning(true);
    try {
      let response = await sendMessageToContent(MessageAction.SCAN_FORM_FIELDS);

      if (!response.success && response.message && response.message.includes('无法连接')) {
        showMessage('正在注入内容脚本...', { severity: 'info' });
        const injected = await injectContentScript();
        if (injected) {
          response = await sendMessageToContent(MessageAction.SCAN_FORM_FIELDS);
        }
      }

      if (response.success && response.fields) {
        setFields(response.fields as FieldData[]);
        showMessage(`扫描完成，发现 ${response.totalCount} 个可填充字段`, { severity: 'success' });
      } else {
        showMessage(response.message || '扫描失败', { severity: 'error' });
      }
    } catch (error) {
      console.error('扫描失败:', error);
      showMessage('扫描失败，请确保页面已加载', { severity: 'error' });
    } finally {
      setScanning(false);
    }
  };

  const sendMessageWithHandler = async (
    action: MessageAction,
    payload?: { includeHidden?: boolean },
  ) => {
    // 防抖处理：防止快速点击导致多次请求
    if (isProcessingRef.current) {
      showMessage('操作进行中，请稍候...', { severity: 'warning' });
      return;
    }

    setLoading(true);
    isProcessingRef.current = true;
    try {
      let response = await sendMessageToContent(action, payload);

      // 如果连接失败，尝试注入内容脚本
      if (!response.success && response.message && response.message.includes('无法连接')) {
        showMessage('正在注入内容脚本...', { severity: 'info' });
        const injected = await injectContentScript();
        if (injected) {
          // 注入成功后再次尝试
          response = await sendMessageToContent(action, payload);
        } else {
          showMessage('内容脚本注入失败，请刷新页面后重试', { severity: 'error' });
          return;
        }
      }

      if (response.success) {
        showMessage(response.message || '操作成功', { severity: 'success' });
      } else {
        // 增强错误提示信息
        const errorMsg = response.message || '操作失败';
        const errorDetails = getErrorDetails(errorMsg);
        showMessage(errorDetails, { severity: 'error' });
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      showMessage(`操作失败：${errorMessage}，请确保当前页面已加载完成`, { severity: 'error' });
    } finally {
      setLoading(false);
      isProcessingRef.current = false;
    }
  };

  // 获取详细的错误信息
  const getErrorDetails = (baseMsg: string): string => {
    if (baseMsg.includes('标签页')) {
      return `${baseMsg}，请确保已打开网页页面`;
    }
    if (baseMsg.includes('注入')) {
      return `${baseMsg}，请检查页面是否支持内容脚本`;
    }
    return baseMsg;
  };

  const handleFillValidData = () => {
    sendMessageWithHandler(MessageAction.FILL_VALID_DATA, { includeHidden });
  };

  const handleFillInvalidData = () => {
    sendMessageWithHandler(MessageAction.FILL_INVALID_DATA, { includeHidden });
  };

  const handleClearAllFields = () => {
    sendMessageWithHandler(MessageAction.CLEAR_ALL_FIELDS);
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

        {/* 扫描按钮 */}
        <Button
          variant="outlined"
          onClick={handleScanFields}
          disabled={scanning}
          fullWidth
          sx={{
            ...formRecognizerPageStyles.buttonStyle,
            mb: 2,
            borderColor: formRecognizerPageStyles.validColor,
            color: formRecognizerPageStyles.validColor,
            '&:hover': {
              borderColor: formRecognizerPageStyles.validDark,
              bgcolor: 'rgba(76, 175, 80, 0.05)',
            },
          }}
          startIcon={scanning ? <CircularProgress size={16} color="inherit" /> : <InputIcon />}
        >
          {scanning ? '扫描中...' : '扫描表单字段'}
        </Button>

        <FieldList
          fields={fields}
          showFields={showFields}
          onToggleShowFields={() => setShowFields(!showFields)}
        />

        <MainActions
          loading={loading}
          onFillValidData={handleFillValidData}
          onFillInvalidData={handleFillInvalidData}
          onClearAllFields={handleClearAllFields}
        />

        <OptionsPanel includeHidden={includeHidden} onIncludeHiddenChange={setIncludeHidden} />

        <GlobalSnackbar {...snackbarProps} />
      </Container>
    </Box>
  );
};

export default FormRecognizerPage;
