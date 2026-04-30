import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Button,
  CircularProgress,
  FormControlLabel,
  Switch,
  alpha,
} from '@mui/material';
import InputIcon from '@mui/icons-material/Input';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import GlobalSnackbar, { useSnackbar } from '@/components/GlobalSnackbar';
import { dashboardPageStyles, formRecognizerPageStyles } from '@/config/pageTheme';
import { MessageAction, sendMessageToContent, injectContentScript } from '@/utils/messages';
import { FillMode } from '@/utils/dummyDataGenerator';
import FieldList from '@/components/FieldList';
import { useStorageState } from '@/utils/useStorageState';
import { FieldTypePreferences } from '@/types/storage';
import PageHeader from '@/components/PageHeader';

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
  useInvalidData?: boolean;
}

const DEFAULT_FIELD_TYPE_PREFERENCES: FieldTypePreferences = {};

const FormRecognizerPage = () => {
  const { snackbarProps, showMessage } = useSnackbar({ autoHideDuration: 1500 });
  const [fillLoading, setFillLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [includeHidden, setIncludeHidden] = useState(false);
  const isProcessingRef = useRef(false);
  const [fields, setFields] = useState<FieldData[]>([]);
  const [scanning, setScanning] = useState(false);
  const [showFields, setShowFields] = useState(false);
  const [hoveredFieldId, setHoveredFieldId] = useState<string | null>(null);
  const [currentDomain, setCurrentDomain] = useState<string>('');
  const [sidePanelOpen, setSidePanelOpen] = useState(false);

  const [fieldTypePreferences, setFieldTypePreferences] = useStorageState(
    'formRecognizer/fieldTypePreferences',
    DEFAULT_FIELD_TYPE_PREFERENCES,
  );

  // 获取当前域名
  useEffect(() => {
    const getActiveTab = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.url) {
          const url = new URL(tab.url);
          setCurrentDomain(url.hostname);
        }
      } catch (error) {
        console.error('获取标签页信息失败:', error);
      }
    };
    getActiveTab();
  }, []);

  // 检测侧边栏状态
  useEffect(() => {
    console.log('开始检测侧边栏状态');
    const checkSidePanelState = async () => {
      try {
        // 检查 chrome.runtime.getContexts 是否可用
        if (typeof chrome.runtime.getContexts === 'function') {
          const contexts = await chrome.runtime.getContexts({
            contextTypes: ['SIDE_PANEL'],
          });
          console.log('侧边栏上下文:', contexts);
          setSidePanelOpen(contexts.length > 0);
        } else {
          console.log('chrome.runtime.getContexts 不可用');
          setSidePanelOpen(false);
        }
      } catch (error) {
        console.error('检测侧边栏状态失败:', error);
        setSidePanelOpen(false);
      }
    };

    // 初始检查
    checkSidePanelState();

    // 定期检查侧边栏状态（每 500ms）
    const interval = setInterval(checkSidePanelState, 500);

    console.log('侧边栏状态检测已启动');
    return () => {
      console.log('清理侧边栏状态检测');
      clearInterval(interval);
    };
  }, []);

  // 生成字段标识符
  const getFieldIdentifier = (field: Pick<FieldData, 'label' | 'name' | 'placeholder'>): string => {
    return field.label || field.name || field.placeholder || 'unknown';
  };

  // 应用保存的类型偏好
  const applySavedPreferences = (fields: FieldData[]): FieldData[] => {
    if (!currentDomain || !(fieldTypePreferences as FieldTypePreferences)[currentDomain]) {
      return fields;
    }
    const prefs = (fieldTypePreferences as FieldTypePreferences)[currentDomain];
    return fields.map((field) => {
      const identifier = getFieldIdentifier(field);
      if (prefs && prefs[identifier]) {
        return { ...field, fieldType: prefs[identifier] };
      }
      return field;
    });
  };

  // 保存类型偏好
  const saveTypePreference = (field: FieldData, newType: string) => {
    if (!currentDomain) return;
    const identifier = getFieldIdentifier(field);
    setFieldTypePreferences((prev) => {
      const prevPrefs = prev as FieldTypePreferences;
      const currentDomainPrefs = prevPrefs[currentDomain] || {};
      return {
        ...prevPrefs,
        [currentDomain]: {
          ...currentDomainPrefs,
          [identifier]: newType,
        },
      } as FieldTypePreferences;
    });
  };

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
        const fieldsWithPreferences = applySavedPreferences(response.fields as FieldData[]);
        setFields(fieldsWithPreferences);
        setShowFields(true);
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

  // 更新字段类型
  const handleFieldTypeChange = (fieldId: string, newType: string) => {
    setFields((prev) =>
      prev.map((field) => {
        if (field.id === fieldId) {
          const updatedField = {
            ...field,
            fieldType: newType,
            // 清空旧的 generatedValue，保持界面一致性
            generatedValue: '',
          };
          saveTypePreference(field, newType);
          return updatedField;
        }
        return field;
      }),
    );
  };

  // 切换单个字段的选中状态
  const handleToggleFieldSelection = (fieldId: string) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === fieldId ? { ...field, isSelected: !field.isSelected } : field,
      ),
    );
  };

  // 全选/取消全选
  const handleToggleAllFields = () => {
    setFields((prev) => {
      const allSelected = prev.every((f) => f.isSelected);
      return prev.map((f) => ({ ...f, isSelected: !allSelected }));
    });
  };

  // 定位字段（闪烁）
  const handleLocateField = async (fieldId: string) => {
    try {
      const response = await sendMessageToContent(MessageAction.FLASH_FIELD, { fieldId });
      if (!response.success) {
        showMessage(response.message || '定位字段失败', { severity: 'error' });
      }
    } catch (error) {
      console.error('定位字段失败:', error);
    }
  };

  // 悬停高亮
  const handleHoverField = async (fieldId: string | null) => {
    setHoveredFieldId(fieldId);
    try {
      if (fieldId) {
        await sendMessageToContent(MessageAction.HIGHLIGHT_FIELD, { fieldId });
      } else {
        await sendMessageToContent(MessageAction.UNHIGHLIGHT_ALL_FIELDS);
      }
    } catch (error) {
      console.error('高亮字段失败:', error);
    }
  };

  // 填充选中字段
  const handleFillSelectedFields = async () => {
    if (isProcessingRef.current) {
      showMessage('操作进行中，请稍候...', { severity: 'warning' });
      return;
    }

    const selectedCount = fields.filter((f) => f.isSelected).length;
    if (selectedCount === 0) {
      showMessage('请先选择要填充的字段', { severity: 'warning' });
      return;
    }

    setFillLoading(true);
    isProcessingRef.current = true;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const messageFields = fields as any;
      let response = await sendMessageToContent(MessageAction.FILL_SELECTED_FIELDS, {
        fields: messageFields,
        mode: FillMode.VALID,
        includeHidden,
      });

      if (!response.success && response.message && response.message.includes('无法连接')) {
        showMessage('正在注入内容脚本...', { severity: 'info' });
        const injected = await injectContentScript();
        if (injected) {
          response = await sendMessageToContent(MessageAction.FILL_SELECTED_FIELDS, {
            fields: messageFields,
            mode: FillMode.VALID,
            includeHidden,
          });
        }
      }

      if (response.success) {
        showMessage(response.message || '填充成功', { severity: 'success' });
      } else {
        showMessage(response.message || '填充失败', { severity: 'error' });
      }
    } catch (error) {
      console.error('填充失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      showMessage(`填充失败：${errorMessage}，请确保当前页面已加载完成`, { severity: 'error' });
    } finally {
      setFillLoading(false);
      isProcessingRef.current = false;
    }
  };

  // 清空所有字段
  const handleClearAllFields = async () => {
    if (isProcessingRef.current) {
      showMessage('操作进行中，请稍候...', { severity: 'warning' });
      return;
    }

    setClearLoading(true);
    isProcessingRef.current = true;
    try {
      let response = await sendMessageToContent(MessageAction.CLEAR_ALL_FIELDS);

      if (!response.success && response.message && response.message.includes('无法连接')) {
        showMessage('正在注入内容脚本...', { severity: 'info' });
        const injected = await injectContentScript();
        if (injected) {
          response = await sendMessageToContent(MessageAction.CLEAR_ALL_FIELDS);
        }
      }

      if (response.success) {
        showMessage(response.message || '清空成功', { severity: 'success' });
      } else {
        showMessage(response.message || '清空失败', { severity: 'error' });
      }
    } catch (error) {
      console.error('清空失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      showMessage(`清空失败：${errorMessage}，请确保当前页面已加载完成`, { severity: 'error' });
    } finally {
      setClearLoading(false);
      isProcessingRef.current = false;
    }
  };

  // 打开侧边栏
  const handleOpenSidePanel = async () => {
    try {
      await chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
      showMessage('侧边栏已打开', { severity: 'success' });
    } catch (error) {
      console.error('打开侧边栏失败:', error);
      showMessage('打开侧边栏失败', { severity: 'error' });
    }
  };

  const selectedCount = fields.filter((f) => f.isSelected).length;

  return (
    <Box sx={{ bgcolor: dashboardPageStyles.backgroundColor, minHeight: '100%', pb: 4 }}>
      <Container maxWidth="sm" sx={{ py: 3, px: 2, bgcolor: '#f5f5f5' }}>
        {/* Header */}
        <PageHeader
          title="表单测试数据填充器"
          subtitle="一键填充表单测试数据，提升开发和测试效率"
          icon={<InputIcon />}
          iconColor={formRecognizerPageStyles.primaryColor}
          sx={{ mb: 2.5 }}
        />

        <Button
          size="small"
          startIcon={<OpenInNewIcon />}
          onClick={handleOpenSidePanel}
          sx={{
            textTransform: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: sidePanelOpen ? 0 : 1,
            transform: sidePanelOpen ? 'scale(0.8)' : 'scale(1)',
            pointerEvents: sidePanelOpen ? 'none' : 'auto',
            visibility: sidePanelOpen ? 'hidden' : 'visible',
            position: 'relative',
          }}
        >
          侧边栏
        </Button>

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
          onFieldTypeChange={handleFieldTypeChange}
          onLocateField={handleLocateField}
          onHoverField={handleHoverField}
          onToggleFieldSelection={handleToggleFieldSelection}
          onToggleAllFields={handleToggleAllFields}
          hoveredFieldId={hoveredFieldId}
        />

        {/* 操作按钮 */}
        {fields.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              disableElevation
              disableRipple
              variant="contained"
              onClick={handleFillSelectedFields}
              disabled={fillLoading || selectedCount === 0}
              fullWidth
              sx={{
                py: 1.6,
                borderRadius: 4,
                bgcolor: formRecognizerPageStyles.validColor,
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: formRecognizerPageStyles.validDark,
                  boxShadow: `0 8px 24px ${alpha(formRecognizerPageStyles.validColor, 0.3)}`,
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  bgcolor: '#e0e0e0',
                  color: '#9e9e9e',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              填充选中字段
            </Button>

            <Button
              disableElevation
              disableRipple
              variant="outlined"
              onClick={handleClearAllFields}
              disabled={clearLoading}
              fullWidth
              sx={{
                py: 1.6,
                borderRadius: 4,
                borderColor: formRecognizerPageStyles.clearColor,
                color: formRecognizerPageStyles.clearColor,
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: formRecognizerPageStyles.clearDark,
                  bgcolor: formRecognizerPageStyles.clearBg,
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  borderColor: '#e0e0e0',
                  color: '#9e9e9e',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              清空所有字段
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={includeHidden}
                onChange={(e) => setIncludeHidden(e.target.checked)}
              />
            }
            label="包含隐藏字段"
          />
        </Box>

        <GlobalSnackbar {...snackbarProps} />
      </Container>
    </Box>
  );
};

export default FormRecognizerPage;
