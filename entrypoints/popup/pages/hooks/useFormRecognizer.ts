import { useState, useRef, useCallback } from 'react';
import { useSnackbar as useGlobalSnackbar } from '@/components/GlobalSnackbar';
import { MessageAction, sendMessageToContent, injectContentScript } from '@/utils/messages';
import { FillMode } from '@/utils/dummyDataGenerator';
import { useStorageState } from '@/utils/useStorageState';
import { FieldTypePreferences } from '@/types/storage';
import { useActiveTabDomain } from './useActiveTabDomain';
import { useSidePanelState } from './useSidePanelState';

// 字段数据接口
export interface FieldData {
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

export function useFormRecognizer() {
  const { showMessage } = useGlobalSnackbar({ autoHideDuration: 1500 });
  const [fillLoading, setFillLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [includeHidden, setIncludeHidden] = useState(false);
  const isProcessingRef = useRef(false);
  const [fields, setFields] = useState<FieldData[]>([]);
  const [scanning, setScanning] = useState(false);
  const [showFields, setShowFields] = useState(false);
  const [hoveredFieldId, setHoveredFieldId] = useState<string | null>(null);

  const currentDomain = useActiveTabDomain();
  const { sidePanelOpen, handleOpenSidePanel } = useSidePanelState();

  const [fieldTypePreferences, setFieldTypePreferences] = useStorageState(
    'formRecognizer/fieldTypePreferences',
    DEFAULT_FIELD_TYPE_PREFERENCES,
  );

  // 生成字段标识符
  const getFieldIdentifier = useCallback(
    (field: Pick<FieldData, 'label' | 'name' | 'placeholder'>): string => {
      return field.label || field.name || field.placeholder || 'unknown';
    },
    [],
  );

  // 应用保存的类型偏好
  const applySavedPreferences = useCallback(
    (fields: FieldData[], domain: string, preferences: FieldTypePreferences): FieldData[] => {
      if (!domain || !preferences[domain]) {
        return fields;
      }
      const prefs = preferences[domain];
      return fields.map((field) => {
        const identifier = getFieldIdentifier(field);
        if (prefs && prefs[identifier]) {
          return { ...field, fieldType: prefs[identifier] };
        }
        return field;
      });
    },
    [getFieldIdentifier],
  );

  // 保存类型偏好
  const saveTypePreference = useCallback(
    (field: FieldData, newType: string) => {
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
    },
    [currentDomain, getFieldIdentifier, setFieldTypePreferences],
  );

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
        const fieldsWithPreferences = applySavedPreferences(
          response.fields as FieldData[],
          currentDomain,
          fieldTypePreferences,
        );
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
      const messageFields = fields as MessageFieldData[];
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

  return {
    fillLoading,
    clearLoading,
    includeHidden,
    setIncludeHidden,
    fields,
    scanning,
    showFields,
    setShowFields,
    hoveredFieldId,
    sidePanelOpen,
    handleScanFields,
    handleFieldTypeChange,
    handleToggleFieldSelection,
    handleToggleAllFields,
    handleLocateField,
    handleHoverField,
    handleFillSelectedFields,
    handleClearAllFields,
    handleOpenSidePanel,
    selectedCount: fields.filter((f) => f.isSelected).length,
  };
}
