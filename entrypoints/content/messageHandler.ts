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
import { highlighter } from '@/utils/formMapping/highlighter';

// 存储当前扫描到的字段列表，用于高亮联动
let currentFields: FormFieldInfo[] = [];

/**
 * 初始化消息处理器
 */
export function initMessageHandler() {
  // 页面卸载或导航时清理状态，防止 SPA 等场景下的内存泄漏或旧数据残留
  window.addEventListener('beforeunload', () => {
    currentFields = [];
  });

  onMessage(MessageAction.SCAN_FORM_FIELDS, async () => {
    try {
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
    } catch (error) {
      console.error('SCAN_FORM_FIELDS 失败:', error);
      return { success: false, error: '扫描表单失败' };
    }
  });

  onMessage(MessageAction.FILL_VALID_DATA, async (message) => {
    try {
      fillAllFields(FillMode.VALID, message.data.includeHidden || false);
      return { success: true, message: '已填充有效数据' };
    } catch {
      return { success: false, error: '填充失败' };
    }
  });

  onMessage(MessageAction.FILL_INVALID_DATA, async (message) => {
    try {
      fillAllFields(FillMode.INVALID, message.data.includeHidden || false);
      return { success: true, message: '已填充无效数据' };
    } catch {
      return { success: false, error: '填充失败' };
    }
  });

  onMessage(MessageAction.FILL_SELECTED_FIELDS, async (message) => {
    try {
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
    } catch {
      return { success: false, error: '部分填充失败' };
    }
  });

  onMessage(MessageAction.CLEAR_ALL_FIELDS, async () => {
    try {
      clearAllFields();
      return { success: true, message: '已清空所有字段' };
    } catch {
      return { success: false, error: '清空失败' };
    }
  });

  onMessage(MessageAction.HIGHLIGHT_FIELD, async (message) => {
    try {
      const { fieldId } = message.data;
      const field = currentFields.find((f) => f.id === fieldId);
      if (field) {
        highlightField(field.element);
        return { success: true };
      }
      return { success: false, message: '未找到字段' };
    } catch {
      return { success: false, error: '高亮失败' };
    }
  });

  onMessage(MessageAction.UNHIGHLIGHT_FIELD, async (message) => {
    try {
      const { fieldId } = message.data;
      const field = currentFields.find((f) => f.id === fieldId);
      if (field) {
        unhighlightField(field.element);
        return { success: true };
      }
      return { success: false, message: '未找到字段' };
    } catch {
      return { success: false, error: '取消高亮失败' };
    }
  });

  onMessage(MessageAction.HIGHLIGHT_ALL_FIELDS, async (message) => {
    try {
      const { fieldIds } = message.data;
      fieldIds.forEach((id) => {
        const field = currentFields.find((f) => f.id === id);
        if (field) {
          highlightField(field.element);
        }
      });
      return { success: true };
    } catch {
      return { success: false, error: '全选高亮失败' };
    }
  });

  onMessage(MessageAction.UNHIGHLIGHT_ALL_FIELDS, async () => {
    try {
      currentFields.forEach((field) => {
        unhighlightField(field.element);
      });
      return { success: true };
    } catch {
      return { success: false, error: '清除所有高亮失败' };
    }
  });

  onMessage(MessageAction.FLASH_FIELD, async (message) => {
    try {
      const { fieldId } = message.data;
      const field = currentFields.find((f) => f.id === fieldId);
      if (field) {
        flashField(field.element);
        return { success: true };
      }
      return { success: false, message: '未找到字段' };
    } catch {
      return { success: false, error: '闪烁定位失败' };
    }
  });

  onMessage(MessageAction.FLASH_SELECTOR, async (message) => {
    try {
      const { entry, duration } = message.data;
      const match = FuzzyMatcher.findTargetElement(entry.fingerprint);
      if (match.element) {
        // 使用 canvas 高亮器进行闪烁，并配合滚动
        highlighter.flash([entry], duration);
        match.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return { success: true };
      }
      return { success: false, message: '未能在页面上定位到元素' };
    } catch (error) {
      console.error('FLASH_SELECTOR 失败:', error);
      return { success: false, error: '定位处理出错' };
    }
  });

  onMessage(MessageAction.FLASH_MULTIPLE_SELECTORS, async (message) => {
    try {
      const { entries, duration } = message.data;

      // 检查哪些元素能被找到，用于统计
      let count = 0;
      entries.forEach((entry) => {
        const match = FuzzyMatcher.findTargetElement(entry.fingerprint);
        if (match.element) {
          count++;
        }
      });

      // 使用新版 canvas 高亮器进行批量闪烁
      highlighter.flash(entries, duration);

      return {
        success: count > 0,
        message: count > 0 ? `成功定位并高亮 ${count} 个元素` : '未能在页面上定位到任何元素',
      };
    } catch (error) {
      console.error('FLASH_MULTIPLE_SELECTORS 失败:', error);
      return { success: false, error: '批量定位处理出错' };
    }
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
