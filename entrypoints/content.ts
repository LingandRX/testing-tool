import '../.wxt/types/imports.d.ts';
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

import { SmartDetector } from '@/utils/formMapping/scanner';
import { highlighter } from '@/utils/formMapping/highlighter';
import {
  FuzzyMatcher,
  SmartInjectionEngine,
  FeedbackRenderer,
} from '@/utils/formMapping/smartInjector';
import { storageUtil } from '@/utils/chromeStorage';
import { FormMapEntry } from '@/types/storage';

// 存储当前扫描到的字段列表，用于高亮联动
let currentFields: FormFieldInfo[] = [];

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_end',
  main() {
    // === 通用表单映射助手逻辑 ===
    chrome.storage.onChanged.addListener((changes, area) => {
      if (
        area === 'local' &&
        (changes['active_form_map'] || changes['app/formMapping/isPicking'])
      ) {
        updateMappingUI();
      }
    });

    async function updateMappingUI() {
      const entries = ((await storageUtil.get('active_form_map')) as FormMapEntry[]) || [];
      const isPicking = ((await storageUtil.get('app/formMapping/isPicking')) as boolean) || false;

      if (entries.length > 0 || isPicking) {
        highlighter.show();
        highlighter.draw(entries);

        if (isPicking) {
          highlighter.enablePicker(async (el) => {
            const fingerprint = SmartDetector.generateFingerprint(el);
            const label = SmartDetector.extractSemanticLabel(el);

            const newEntry: FormMapEntry = {
              id: Math.random().toString(36).substr(2, 9),
              label_display: label,
              fingerprint,
              action_logic: { type: 'text', strategy: 'fixed', value: '' },
              ui_state: { is_selected: true },
            };

            const currentMap = ((await storageUtil.get('active_form_map')) as FormMapEntry[]) || [];
            await storageUtil.set('active_form_map', [...currentMap, newEntry]);
            await storageUtil.set('app/formMapping/isPicking', false);
          });
        } else {
          highlighter.disablePicker();
        }
      } else {
        highlighter.hide();
      }
    }

    // 初始加载映射 UI
    updateMappingUI();

    // === 原有表单识别逻辑 ===
    // 使用 @webext-core/messaging 监听消息
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
  },
});
