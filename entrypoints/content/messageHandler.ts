import {
  fillAllFields,
  clearAllFields,
  fillSelectedFields,
  scanFormFields,
  highlightField,
  unhighlightField,
  flashField,
  FillMode,
  type FormFieldInfo,
} from '@/utils/dummyDataGenerator';
import { MessageAction, onMessage } from '@/utils/messages';
import {
  FuzzyMatcher,
  SmartInjectionEngine,
  FeedbackRenderer,
} from '@/utils/formMapping/smartInjector';
import { FormMapEntry } from '@/types/storage';

// 存储当前扫描到的字段列表，用于高亮联动
let currentFields: FormFieldInfo[] = [];

/**
 * 初始化消息处理器
 */
export function initMessageHandler() {
  onMessage(MessageAction.SCAN_FORM_FIELDS, async () => {
    const result = scanFormFields();
    currentFields = result.fields;
    return {
      success: true,
      fields: result.fields.map((f) => ({
        id: f.id,
        fieldType: f.fieldType,
        label: f.label,
        placeholder: f.placeholder,
        name: f.name,
        value: f.value,
        isSelected: f.isSelected,
        generatedValue: f.generatedValue,
      })),
      totalCount: result.totalCount,
      validCount: result.validCount,
      hasModal: !!result.modalContainer,
    };
  });

  onMessage(MessageAction.FILL_VALID_DATA, async (message) => {
    fillAllFields(FillMode.VALID, message.data.includeHidden || false);
    return { success: true, message: '已填充有效数据' };
  });

  onMessage(MessageAction.FILL_INVALID_DATA, async (message) => {
    fillAllFields(FillMode.INVALID, message.data.includeHidden || false);
    return { success: true, message: '已填充无效数据' };
  });

  onMessage(MessageAction.FILL_SELECTED_FIELDS, async (message) => {
    const { fields: incomingFields, mode } = message.data;
    const fieldsToFill = currentFields.map((field) => {
      const incomingField = incomingFields.find((f) => f.id === field.id);
      if (incomingField) {
        return {
          ...field,
          fieldType: incomingField.fieldType,
          isSelected: incomingField.isSelected,
          useInvalidData: incomingField.useInvalidData,
        };
      }
      return field;
    });
    const count = fillSelectedFields(fieldsToFill, mode || FillMode.VALID);
    return { success: true, message: `已填充 ${count} 个字段` };
  });

  onMessage(MessageAction.CLEAR_ALL_FIELDS, async () => {
    clearAllFields();
    return { success: true, message: '已清空所有字段' };
  });

  onMessage(MessageAction.HIGHLIGHT_FIELD, async (message) => {
    const { fieldId } = message.data;
    const field = currentFields.find((f) => f.id === fieldId);
    if (field) {
      highlightField(field.element);
      return { success: true };
    }
    return { success: false, message: '未找到字段' };
  });

  onMessage(MessageAction.UNHIGHLIGHT_FIELD, async (message) => {
    const { fieldId } = message.data;
    const field = currentFields.find((f) => f.id === fieldId);
    if (field) {
      unhighlightField(field.element);
      return { success: true };
    }
    return { success: false, message: '未找到字段' };
  });

  onMessage(MessageAction.HIGHLIGHT_ALL_FIELDS, async (message) => {
    const { fieldIds } = message.data;
    fieldIds.forEach((id) => {
      const field = currentFields.find((f) => f.id === id);
      if (field) {
        highlightField(field.element);
      }
    });
    return { success: true };
  });

  onMessage(MessageAction.UNHIGHLIGHT_ALL_FIELDS, async () => {
    currentFields.forEach((field) => {
      unhighlightField(field.element);
    });
    return { success: true };
  });

  onMessage(MessageAction.FLASH_FIELD, async (message) => {
    const { fieldId } = message.data;
    const field = currentFields.find((f) => f.id === fieldId);
    if (field) {
      flashField(field.element);
      return { success: true };
    }
    return { success: false, message: '未找到字段' };
  });

  onMessage(MessageAction.FORM_INJECT, async (message) => {
    try {
      const injectData =
        (message.data.data as Array<{ entry: FormMapEntry; mockValue: string }>) || [];
      const results = injectData.map((item) => {
        const matchResult = FuzzyMatcher.findTargetElement(item.entry.fingerprint);
        if (matchResult.element) {
          const injectResult = SmartInjectionEngine.inject(
            matchResult.element,
            item.entry,
            item.mockValue,
          );
          if (injectResult.success) {
            FeedbackRenderer.renderSuccess(matchResult.element);
          } else {
            FeedbackRenderer.renderError(matchResult.element);
          }
          return { id: item.entry.id, success: injectResult.success };
        } else {
          return { id: item.entry.id, success: false };
        }
      });
      return { success: true, results };
    } catch (error) {
      console.error('智能注入失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '注入失败',
      };
    }
  });
}
