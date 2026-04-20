import { useState, useRef } from 'react';
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
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Divider,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InputIcon from '@mui/icons-material/Input';
import FolderIcon from '@mui/icons-material/Folder';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import GlobalSnackbar, { useSnackbar } from '@/components/GlobalSnackbar';
import { dashboardPageStyles, formRecognizerPageStyles } from '@/config/pageTheme';
import { MessageAction, sendMessageToContent, injectContentScript } from '@/utils/messages';
import { DataTemplateManager, type DataTemplate } from '@/utils/dataTemplate';

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

// 字段类型显示名称映射
const FIELD_TYPE_NAMES: Record<string, string> = {
  text: '文本',
  email: '邮箱',
  phone: '手机号',
  number: '数字',
  date: '日期',
  textarea: '文本域',
  radio: '单选框',
  checkbox: '复选框',
  select: '下拉框',
  password: '密码',
  name: '姓名',
  id_card: '身份证号',
  unknown: '未知',
};

// 字段类型颜色映射
const FIELD_TYPE_COLORS: Record<
  string,
  'default' | 'primary' | 'secondary' | 'error' | 'success' | 'warning'
> = {
  email: 'primary',
  phone: 'success',
  number: 'secondary',
  date: 'warning',
  password: 'error',
  name: 'primary',
  id_card: 'secondary',
  text: 'default',
  textarea: 'default',
  unknown: 'default',
};

const FormRecognizerPage = () => {
  const { snackbarProps, showMessage } = useSnackbar({ autoHideDuration: 1500 });
  const [loading, setLoading] = useState(false);
  const [includeHidden, setIncludeHidden] = useState(false);
  const isProcessingRef = useRef(false);
  const [fields, setFields] = useState<FieldData[]>([]);
  const [scanning, setScanning] = useState(false);
  const [showFields, setShowFields] = useState(false);
  const [operationHistory, setOperationHistory] = useState<
    Array<{
      time: string;
      type: string;
      content: string;
      result: string;
    }>
  >([]);
  const [showHistory, setShowHistory] = useState(false);
  const [templates, setTemplates] = useState<DataTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);

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
        addOperationHistory('扫描', `扫描表单字段，发现 ${response.totalCount} 个字段`, '成功');
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

  // 添加操作历史记录
  const addOperationHistory = (type: string, content: string, result: string) => {
    const newEntry = {
      time: new Date().toLocaleString('zh-CN'),
      type,
      content,
      result,
    };
    setOperationHistory((prev) => [newEntry, ...prev].slice(0, 50)); // 最多保留50条记录
  };

  // 加载模板列表
  const loadTemplates = async () => {
    setTemplateLoading(true);
    try {
      const allTemplates = await DataTemplateManager.getAllTemplates();
      setTemplates(allTemplates);
    } catch (error) {
      console.error('加载模板失败:', error);
      showMessage('加载模板失败', { severity: 'error' });
    } finally {
      setTemplateLoading(false);
    }
  };

  // 导出模板
  const handleExportTemplates = async () => {
    const allTemplates = await DataTemplateManager.getAllTemplates();
    if (allTemplates.length === 0) {
      showMessage('没有可导出的模板', { severity: 'warning' });
      return;
    }
    const jsonStr = DataTemplateManager.exportTemplates(allTemplates);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `templates_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage(`已导出 ${allTemplates.length} 个模板`, { severity: 'success' });
    addOperationHistory('导出', `导出 ${allTemplates.length} 个模板`, '成功');
  };

  // 导入模板
  const handleImportTemplates = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        const success = await DataTemplateManager.importTemplates(content);
        if (success) {
          showMessage('模板导入成功', { severity: 'success' });
          addOperationHistory('导入', '导入模板', '成功');
          loadTemplates();
        } else {
          showMessage('模板导入失败，请检查文件格式', { severity: 'error' });
        }
      };
      reader.readAsText(file);
    };
    input.click();
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
    addOperationHistory('填充', '填充有效数据', '成功');
  };

  const handleFillInvalidData = () => {
    sendMessageWithHandler(MessageAction.FILL_INVALID_DATA, { includeHidden });
    addOperationHistory('填充', '填充异常数据', '成功');
  };

  const handleClearAllFields = () => {
    sendMessageWithHandler(MessageAction.CLEAR_ALL_FIELDS);
    addOperationHistory('清空', '清空所有表单字段', '成功');
  };

  return (
    <Box sx={{ bgcolor: dashboardPageStyles.backgroundColor, minHeight: '100%', pb: 4 }}>
      <Container maxWidth="sm" sx={{ py: 3, px: 2, backgroundColor: '#fff' }}>
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

        {/* 字段列表 */}
        {fields.length > 0 && (
          <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', mb: 2 }}>
            <Box
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                px: 2,
                py: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setShowFields(!showFields)}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                已识别字段 ({fields.length})
              </Typography>
              {showFields ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
            <Collapse in={showFields}>
              <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                {fields.map((field, index) => (
                  <ListItem key={field.id} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <InputIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {field.label || field.name || field.placeholder || `字段 ${index + 1}`}
                          </Typography>
                          <Chip
                            label={FIELD_TYPE_NAMES[field.fieldType] || '未知'}
                            size="small"
                            color={FIELD_TYPE_COLORS[field.fieldType] || 'default'}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={field.placeholder || field.name}
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Paper>
        )}

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
              ...formRecognizerPageStyles.buttonStyle,
              bgcolor: formRecognizerPageStyles.validColor,
              '&:hover': {
                bgcolor: formRecognizerPageStyles.validDark,
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
              ...formRecognizerPageStyles.buttonStyle,
              bgcolor: formRecognizerPageStyles.invalidColor,
              '&:hover': {
                bgcolor: formRecognizerPageStyles.invalidDark,
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
              ...formRecognizerPageStyles.buttonStyle,
              borderColor: formRecognizerPageStyles.clearColor,
              color: formRecognizerPageStyles.clearColor,
              '&:hover': {
                borderColor: formRecognizerPageStyles.clearDark,
                bgcolor: formRecognizerPageStyles.clearBg,
              },
            }}
          >
            {loading ? '清空中...' : '一键清空所有表单'}
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

        {/* 操作历史记录 */}
        {operationHistory.length > 0 && (
          <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', mb: 4 }}>
            <Box
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                px: 2,
                py: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setShowHistory(!showHistory)}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                操作历史 ({operationHistory.length})
              </Typography>
              {showHistory ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
            <Collapse in={showHistory}>
              <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                {operationHistory.map((item, index) => (
                  <Box key={index}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={item.type}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            <Typography variant="body2">{item.content}</Typography>
                          </Box>
                        }
                        secondary={`${item.time} · ${item.result}`}
                      />
                    </ListItem>
                  </Box>
                ))}
              </List>
            </Collapse>
          </Paper>
        )}

        {/* 模板管理 */}
        <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', mb: 4 }}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              px: 2,
              py: 1.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => {
              setShowTemplates(!showTemplates);
              if (!showTemplates) loadTemplates();
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              模板管理 ({templates.length})
            </Typography>
            {showTemplates ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Box>
          <Collapse in={showTemplates}>
            <Box sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportTemplates}
                  variant="outlined"
                >
                  导出
                </Button>
                <Button
                  size="small"
                  startIcon={<UploadIcon />}
                  onClick={handleImportTemplates}
                  variant="outlined"
                >
                  导入
                </Button>
              </Stack>
              {templateLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={20} />
                </Box>
              ) : templates.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'center', py: 2 }}
                >
                  暂无模板，请先在其他页面创建模板
                </Typography>
              ) : (
                <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {templates.map((template) => (
                    <ListItem key={template.id} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <FolderIcon fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={template.name}
                        secondary={`${template.fields.length} 个字段 · ${new Date(template.updatedAt).toLocaleDateString('zh-CN')}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Collapse>
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
