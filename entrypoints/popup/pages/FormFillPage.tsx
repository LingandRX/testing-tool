import {
  Box,
  Typography,
  Container,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Switch,
  Divider,
  Paper,
  Button,
  Chip,
  Snackbar,
  Alert,
  alpha,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useEffect, useState, useCallback } from 'react';
import { storageUtil } from '@/utils/chromeStorage';
import { FormMapEntry } from '@/types/storage';
import PageHeader from '@/components/PageHeader';
import { formMappingPageStyles } from '@/config/pageTheme.ts';
import { MockDataGenerator } from '@/utils/formMapping/smartInjector';

export default function FormFillPage() {
  const [entries, setEntries] = useState<FormMapEntry[]>([]);
  const [previewData, setPreviewData] = useState<Map<string, string>>(new Map());
  const [injectResults, setInjectResults] = useState<Map<string, boolean>>(new Map());
  const [isInjecting, setIsInjecting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const generatePreviewData = useCallback((items: FormMapEntry[]) => {
    const preview = new Map<string, string>();
    items.forEach((entry) => {
      const value = MockDataGenerator.generate(entry.action_logic, entry);
      preview.set(entry.id, value);
    });
    setPreviewData(preview);
    setInjectResults(new Map());
  }, []);

  useEffect(() => {
    const loadEntries = async () => {
      const data = (await storageUtil.get('active_form_map')) as FormMapEntry[];
      setEntries(data || []);
      generatePreviewData(data || []);
    };

    loadEntries();
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
      if (area === 'local' && changes['active_form_map']) {
        loadEntries();
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, [generatePreviewData]);

  const refreshPreview = () => {
    generatePreviewData(entries);
  };

  const injectAllFields = async () => {
    if (entries.length === 0) {
      setErrorMessage('没有可填充的字段');
      setShowError(true);
      return;
    }

    setIsInjecting(true);
    const results = new Map<string, boolean>();

    try {
      // 发送消息到 content script 执行注入
      const response = await chrome.tabs.query({ active: true, currentWindow: true });
      if (response.length === 0) {
        throw new Error('无法获取当前标签页');
      }

      const tabId = response[0].id;
      if (!tabId) {
        throw new Error('标签页ID无效');
      }

      // 准备注入数据
      const injectData = entries.map((entry) => ({
        entry,
        mockValue: previewData.get(entry.id) || '',
      }));

      // 执行注入
      const result = await chrome.tabs.sendMessage(tabId, {
        type: 'FORM_INJECT',
        data: injectData,
      });

      if (result && result.success) {
        result.results.forEach((r: { id: string; success: boolean }) => {
          results.set(r.id, r.success);
        });
        setInjectResults(results);
        setShowSuccess(true);
      } else {
        throw new Error(result?.error || '注入失败');
      }
    } catch (error) {
      console.error('注入失败:', error);
      setErrorMessage(
        error instanceof Error ? error.message : '注入失败，请确保已在网页中打开表单',
      );
      setShowError(true);
    } finally {
      setIsInjecting(false);
    }
  };

  const getFieldTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: '文本',
      select: '下拉框',
      checkbox: '复选框',
      radio: '单选框',
    };
    return labels[type] || type;
  };

  const getStrategyLabel = (strategy: string) => {
    const labels: Record<string, string> = {
      fixed: '固定值',
      random: '随机',
      sequence: '序列',
    };
    return labels[strategy] || strategy;
  };

  return (
    <Box>
      <Container sx={{ py: 2 }}>
        <PageHeader
          title="智能表单填充"
          subtitle="基于指纹识别的精准数据注入"
          icon={<PlayArrowIcon />}
        />
        <Container maxWidth="sm" sx={{ py: 2, px: 0 }}>
          {/* 操作区域 */}
          <Paper
            sx={{
              p: 2,
              mb: 2.5,
              bgcolor: 'background.paper',
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'grey.100',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1.5,
              }}
            >
              <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                填充控制
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={refreshPreview}
                  size="small"
                  startIcon={<RefreshIcon />}
                  sx={{ borderRadius: 3 }}
                >
                  刷新预览
                </Button>
                <Button
                  variant="contained"
                  onClick={injectAllFields}
                  size="small"
                  startIcon={<PlayArrowIcon />}
                  disabled={isInjecting || entries.length === 0}
                  sx={{
                    borderRadius: 3,
                    bgcolor: formMappingPageStyles.secondaryColor || '#9c27b0',
                    boxShadow: `0 4px 12px ${alpha(formMappingPageStyles.secondaryColor || '#9c27b0', 0.2)}`,
                  }}
                >
                  {isInjecting ? '注入中...' : '开始填充'}
                </Button>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              点击"开始填充"后，将根据映射配置向网页表单注入数据。
            </Typography>
          </Paper>

          {/* 字段列表 */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1.5,
              px: 0.5,
            }}
          >
            <Typography variant="subtitle2" fontWeight={800} color="text.secondary">
              映射字段 ({entries.length})
            </Typography>
          </Box>

          <List
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 4,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'grey.100',
            }}
          >
            {entries.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="暂无映射字段"
                  secondary="请先在表单映射页面配置字段"
                  slotProps={{
                    primary: {
                      align: 'center',
                      color: 'text.secondary',
                    },
                    secondary: {
                      align: 'center',
                    },
                  }}
                />
              </ListItem>
            ) : (
              entries.map((entry, index) => (
                <Box key={entry.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    secondaryAction={
                      <IconButton edge="end" aria-label="preview">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    }
                    sx={{ py: 1.5 }}
                  >
                    <Switch
                      edge="start"
                      checked={entry.ui_state.is_selected}
                      disabled
                      sx={{ mr: 2 }}
                    />
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <span style={{ fontWeight: 500 }}>{entry.label_display}</span>
                          <Chip
                            size="small"
                            label={getFieldTypeLabel(entry.action_logic.type)}
                            sx={{
                              fontSize: '0.65rem',
                              bgcolor: 'grey.100',
                              color: 'grey.700',
                            }}
                          />
                          <Chip
                            size="small"
                            label={getStrategyLabel(entry.action_logic.strategy)}
                            sx={{
                              fontSize: '0.65rem',
                              bgcolor: formMappingPageStyles.secondaryColor + '20',
                              color: formMappingPageStyles.secondaryColor || '#9c27b0',
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '0.7rem',
                              color: 'text.secondary',
                              mb: 1,
                            }}
                          >
                            {entry.fingerprint.selector}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              sx={{
                                fontSize: '0.75rem',
                                color: 'primary.main',
                                fontStyle: 'italic',
                                wordBreak: 'break-all',
                                maxWidth: '250px',
                              }}
                            >
                              预览: {previewData.get(entry.id) || '---'}
                            </Typography>
                            {injectResults.has(entry.id) &&
                              (injectResults.get(entry.id) ? (
                                <CheckCircleIcon sx={{ color: '#32CD32', fontSize: '1rem' }} />
                              ) : (
                                <CancelIcon sx={{ color: '#FF4444', fontSize: '1rem' }} />
                              ))}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                </Box>
              ))
            )}
          </List>

          {/* 统计信息 */}
          {injectResults.size > 0 && (
            <Box sx={{ mt: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: 'grey.50',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'grey.200',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                  <Box textAlign="center">
                    <Typography variant="h5" fontWeight={800} color="primary.main">
                      {Array.from(injectResults.values()).filter(Boolean).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      成功注入
                    </Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box textAlign="center">
                    <Typography variant="h5" fontWeight={800} color="error.main">
                      {Array.from(injectResults.values()).filter((v) => !v).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      注入失败
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          )}
        </Container>
      </Container>

      {/* 提示消息 */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success">填充完成！</Alert>
      </Snackbar>
      <Snackbar
        open={showError}
        autoHideDuration={4000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error">{errorMessage}</Alert>
      </Snackbar>
    </Box>
  );
}
