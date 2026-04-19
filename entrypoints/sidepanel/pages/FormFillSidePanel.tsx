import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Checkbox,
  TextField,
  IconButton,
  CircularProgress,
  Switch,
  FormControlLabel,
  Tooltip,
  Alert,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import GlobalSnackbar, { useSnackbar } from '@/components/GlobalSnackbar';
import { FieldType, FillMode } from '@/utils/dummyDataGenerator';

interface FieldData {
  id: string;
  fieldType: FieldType;
  label: string | null;
  placeholder: string;
  name: string;
  value: string;
  isSelected: boolean;
  generatedValue: string;
}

const FormFillSidePanel = () => {
  const { snackbarProps, showMessage } = useSnackbar({ autoHideDuration: 1500 });
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [fields, setFields] = useState<FieldData[]>([]);
  const [mode, setMode] = useState<'valid' | 'invalid'>('valid');
  const [fillEmptyOnly, setFillEmptyOnly] = useState(false);
  const [includeHidden] = useState(false);
  const [hoveredFieldId, setHoveredFieldId] = useState<string | null>(null);

  interface MessagePayload {
    fieldId?: string;
    fieldIds?: string[];
    fields?: FieldData[];
    mode?: FillMode;
    includeHidden?: boolean;
  }

  interface MessageResponse {
    success: boolean;
    message?: string;
    fields?: FieldData[];
    totalCount?: number;
    validCount?: number;
    hasModal?: boolean;
  }

  const sendMessageToContent = useCallback(
    async (action: string, payload?: MessagePayload): Promise<MessageResponse> => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action, ...payload }, (response) => {
          resolve(response as MessageResponse);
        });
      });
    },
    [],
  );

  const handleScan = async () => {
    setScanning(true);
    try {
      const response = await sendMessageToContent('scanFormFields');
      if (response.success) {
        setFields(response.fields || []);
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

  const handleRefreshAll = async () => {
    const updatedFields = fields.map((field) => ({
      ...field,
      generatedValue: generateRandomValue(field.fieldType, mode),
    }));
    setFields(updatedFields);
    showMessage('已刷新所有数据', { severity: 'success' });
  };

  const handleRefreshField = (fieldId: string) => {
    setFields((prevFields) =>
      prevFields.map((field) =>
        field.id === fieldId
          ? { ...field, generatedValue: generateRandomValue(field.fieldType, mode) }
          : field,
      ),
    );
  };

  const handleToggleSelect = (fieldId: string) => {
    setFields((prevFields) =>
      prevFields.map((field) =>
        field.id === fieldId ? { ...field, isSelected: !field.isSelected } : field,
      ),
    );
  };

  const handleSelectAll = () => {
    const allSelected = fields.every((f) => f.isSelected);
    setFields((prevFields) => prevFields.map((field) => ({ ...field, isSelected: !allSelected })));
  };

  const handleEditValue = (fieldId: string, newValue: string) => {
    setFields((prevFields) =>
      prevFields.map((field) =>
        field.id === fieldId ? { ...field, generatedValue: newValue } : field,
      ),
    );
  };

  const handleFill = async () => {
    setLoading(true);
    try {
      const selectedFields = fields.filter((f) => f.isSelected);
      const response = await sendMessageToContent('fillSelectedFields', {
        fields: selectedFields,
        mode: mode === 'valid' ? FillMode.VALID : FillMode.INVALID,
        includeHidden,
      });
      if (response.success) {
        showMessage(response.message || '填充成功', { severity: 'success' });
      } else {
        showMessage(response.message || '填充失败', { severity: 'error' });
      }
    } catch (error) {
      console.error('填充失败:', error);
      showMessage('填充失败', { severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setLoading(true);
    try {
      const response = await sendMessageToContent('clearAllFields');
      if (response.success) {
        showMessage(response.message || '已清空', { severity: 'success' });
      } else {
        showMessage(response.message || '清空失败', { severity: 'error' });
      }
    } catch (error) {
      console.error('清空失败:', error);
      showMessage('清空失败', { severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleHoverField = async (fieldId: string | null) => {
    setHoveredFieldId(fieldId);
    if (fieldId) {
      await sendMessageToContent('highlightField', { fieldId });
    } else {
      await sendMessageToContent('unhighlightAllFields');
    }
  };

  const generateRandomValue = (fieldType: FieldType, fillMode: 'valid' | 'invalid'): string => {
    const chineseNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];
    const englishNames = ['John Doe', 'Jane Smith', 'Bob Wilson', 'Alice Brown'];
    const domains = ['example.com', 'test.com', 'demo.com'];
    const specialChars = '!@#$%^&*()';

    switch (fieldType) {
      case FieldType.NAME:
        return Math.random() > 0.5
          ? chineseNames[Math.floor(Math.random() * chineseNames.length)]
          : englishNames[Math.floor(Math.random() * englishNames.length)];
      case FieldType.EMAIL: {
        const emailPrefix = Math.random().toString(36).substr(2, 8);
        const emailDomain = domains[Math.floor(Math.random() * domains.length)];
        return fillMode === 'valid' ? `${emailPrefix}@${emailDomain}` : `${emailPrefix}example.com`;
      }
      case FieldType.PHONE: {
        const phonePrefixes = ['130', '131', '132', '135', '136', '137', '138', '139'];
        const phonePrefix = phonePrefixes[Math.floor(Math.random() * phonePrefixes.length)];
        const phoneSuffix = Math.floor(Math.random() * 100000000)
          .toString()
          .padStart(8, '0');
        return fillMode === 'valid'
          ? phonePrefix + phoneSuffix
          : phonePrefix + Math.floor(Math.random() * 10000000).toString();
      }
      case FieldType.NUMBER:
        return fillMode === 'valid'
          ? String(Math.floor(Math.random() * 10000))
          : String(-Math.floor(Math.random() * 10000));
      case FieldType.DATE: {
        const days = Math.floor(Math.random() * 365);
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
      }
      case FieldType.TEXTarea:
        return fillMode === 'valid'
          ? '这是一段测试文本，用于填充表单输入区域。'.repeat(3)
          : specialChars.repeat(100);
      case FieldType.PASSWORD:
        return 'Test@123';
      case FieldType.ID_CARD: {
        const areaCode = '110101';
        const year = 1990 + Math.floor(Math.random() * 30);
        const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
        const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, '0');
        return areaCode + year + month + day + random;
      }
      default:
        return fillMode === 'valid' ? '测试数据' : specialChars.repeat(50);
    }
  };

  const getFieldTypeLabel = (fieldType: FieldType): string => {
    const labels: Record<FieldType, string> = {
      [FieldType.TEXT]: '文本',
      [FieldType.EMAIL]: '邮箱',
      [FieldType.PHONE]: '手机',
      [FieldType.NUMBER]: '数字',
      [FieldType.DATE]: '日期',
      [FieldType.TEXTarea]: '文本域',
      [FieldType.RADIO]: '单选',
      [FieldType.CHECKBOX]: '多选',
      [FieldType.SELECT]: '下拉',
      [FieldType.PASSWORD]: '密码',
      [FieldType.NAME]: '姓名',
      [FieldType.ID_CARD]: '身份证',
      [FieldType.UNKNOWN]: '未知',
    };
    return labels[fieldType] || '未知';
  };

  const selectedCount = fields.filter((f) => f.isSelected).length;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
      <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Dummy Data Pro
        </Typography>
        <Typography variant="body2" color="text.secondary">
          智能表单填充助手
        </Typography>
      </Box>

      <Box sx={{ p: 2, bgcolor: 'white', mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={scanning ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
            onClick={handleScan}
            disabled={scanning}
            sx={{ flex: 1 }}
          >
            {scanning ? '扫描中...' : '扫描表单'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AutoFixHighIcon />}
            onClick={handleRefreshAll}
            disabled={fields.length === 0}
          >
            刷新
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={() => setMode('valid')}
            sx={{
              flex: 1,
              bgcolor: mode === 'valid' ? '#4caf50' : '#e0e0e0',
              color: mode === 'valid' ? 'white' : 'text.primary',
            }}
          >
            有效数据
          </Button>
          <Button
            variant="contained"
            color="warning"
            size="small"
            onClick={() => setMode('invalid')}
            sx={{
              flex: 1,
              bgcolor: mode === 'invalid' ? '#ff9800' : '#e0e0e0',
              color: mode === 'invalid' ? 'white' : 'text.primary',
            }}
          >
            异常数据
          </Button>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={fillEmptyOnly}
              onChange={(e) => setFillEmptyOnly(e.target.checked)}
              size="small"
            />
          }
          label="仅填充空字段"
          sx={{ mb: 1 }}
        />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            onClick={handleFill}
            disabled={loading || selectedCount === 0}
            sx={{ flex: 1 }}
          >
            {loading ? '填充中...' : `确认填充 (${selectedCount})`}
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteOutlineIcon />}
            onClick={handleClear}
            disabled={loading}
          >
            清空
          </Button>
        </Box>
      </Box>

      {fields.length > 0 && (
        <Box sx={{ flex: 1, overflow: 'auto', px: 2, pb: 2 }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              字段列表 ({fields.length})
            </Typography>
            <Button size="small" onClick={handleSelectAll}>
              {fields.every((f) => f.isSelected) ? '取消全选' : '全选'}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {fields.map((field) => (
              <Paper
                key={field.id}
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: hoveredFieldId === field.id ? '#e3f2fd' : 'white',
                  border: '1px solid',
                  borderColor: hoveredFieldId === field.id ? '#2196f3' : '#e0e0e0',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => handleHoverField(field.id)}
                onMouseLeave={() => handleHoverField(null)}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Checkbox
                    size="small"
                    checked={field.isSelected}
                    onChange={() => handleToggleSelect(field.id)}
                    sx={{ p: 0, mt: 0.5 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '60%',
                        }}
                      >
                        {field.label || field.placeholder || field.name || '未命名字段'}
                      </Typography>
                      <Tooltip title="字段类型">
                        <Box
                          sx={{
                            px: 0.5,
                            py: 0.25,
                            bgcolor: '#e0e0e0',
                            borderRadius: 1,
                            fontSize: '0.7rem',
                          }}
                        >
                          {getFieldTypeLabel(field.fieldType)}
                        </Box>
                      </Tooltip>
                      <Tooltip title="高亮显示">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHoverField(field.id);
                            setTimeout(() => handleHoverField(null), 2000);
                          }}
                          sx={{ p: 0.5 }}
                        >
                          <HighlightAltIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TextField
                        size="small"
                        fullWidth
                        value={field.generatedValue}
                        onChange={(e) => handleEditValue(field.id, e.target.value)}
                        placeholder="生成的数据..."
                        sx={{
                          '& .MuiInputBase-input': {
                            fontSize: '0.8rem',
                            fontFamily: 'monospace',
                          },
                        }}
                      />
                      <Tooltip title="刷新此项">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRefreshField(field.id);
                          }}
                          sx={{ p: 0.5 }}
                        >
                          <RefreshIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    {field.value && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5, display: 'block' }}
                      >
                        当前值: {field.value}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      {fields.length === 0 && !scanning && (
        <Box
          sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}
        >
          <Alert severity="info" sx={{ width: '100%' }}>
            点击「扫描表单」按钮开始扫描当前页面的表单字段
          </Alert>
        </Box>
      )}

      <GlobalSnackbar {...snackbarProps} />
    </Box>
  );
};

export default FormFillSidePanel;
