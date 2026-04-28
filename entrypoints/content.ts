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
import { MessageAction, type MessagePayload, type MessageResponse } from '@/utils/messages';

// 存储当前扫描到的字段列表，用于高亮联动
let currentFields: FormFieldInfo[] = [];

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_end',
  main() {
    // 监听来自 popup/sidepanel 的消息
    chrome.runtime.onMessage.addListener(
      (message: MessagePayload, _sender, sendResponse: (response: MessageResponse) => void) => {
        try {
          switch (message.action) {
            case MessageAction.SCAN_FORM_FIELDS: {
              const result = scanFormFields();
              currentFields = result.fields;
              sendResponse({
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
              });
              break;
            }
            case MessageAction.FILL_VALID_DATA:
              fillAllFields(FillMode.VALID, message.includeHidden || false);
              sendResponse({ success: true, message: '已填充有效数据' });
              break;
            case MessageAction.FILL_INVALID_DATA:
              fillAllFields(FillMode.INVALID, message.includeHidden || false);
              sendResponse({ success: true, message: '已填充无效数据' });
              break;
            case MessageAction.FILL_SELECTED_FIELDS: {
              // 使用之前扫描时存储的字段，因为它们包含element属性
              const incomingFields = message.fields || [];
              const fieldsToFill = currentFields.map((field) => {
                const incomingField = incomingFields.find((f) => f.id === field.id);
                if (incomingField) {
                  return {
                    ...field,
                    fieldType: incomingField.fieldType,
                    isSelected: incomingField.isSelected,
                    useInvalidData: (incomingField as { useInvalidData?: boolean }).useInvalidData,
                  };
                }
                return field;
              });
              const count = fillSelectedFields(fieldsToFill, message.mode || FillMode.VALID);
              sendResponse({ success: true, message: `已填充 ${count} 个字段` });
              break;
            }
            case MessageAction.CLEAR_ALL_FIELDS:
              clearAllFields();
              sendResponse({ success: true, message: '已清空所有字段' });
              break;
            case MessageAction.HIGHLIGHT_FIELD: {
              const fieldId = message.fieldId;
              const field = currentFields.find((f) => f.id === fieldId);
              if (field) {
                highlightField(field.element);
                sendResponse({ success: true });
              } else {
                sendResponse({ success: false, message: '未找到字段' });
              }
              break;
            }
            case MessageAction.UNHIGHLIGHT_FIELD: {
              const fieldId = message.fieldId;
              const field = currentFields.find((f) => f.id === fieldId);
              if (field) {
                unhighlightField(field.element);
                sendResponse({ success: true });
              } else {
                sendResponse({ success: false, message: '未找到字段' });
              }
              break;
            }
            case MessageAction.HIGHLIGHT_ALL_FIELDS: {
              const fieldIds = message.fieldIds || [];
              fieldIds.forEach((id) => {
                const field = currentFields.find((f) => f.id === id);
                if (field) {
                  highlightField(field.element);
                }
              });
              sendResponse({ success: true });
              break;
            }
            case MessageAction.UNHIGHLIGHT_ALL_FIELDS:
              currentFields.forEach((field) => {
                unhighlightField(field.element);
              });
              sendResponse({ success: true });
              break;
            case MessageAction.FLASH_FIELD: {
              const fieldId = message.fieldId;
              const field = currentFields.find((f) => f.id === fieldId);
              if (field) {
                flashField(field.element);
                sendResponse({ success: true });
              } else {
                sendResponse({ success: false, message: '未找到字段' });
              }
              break;
            }
            default:
              sendResponse({ success: false, message: '未知操作' });
          }
        } catch (error) {
          console.error('执行操作失败:', error);
          sendResponse({ success: false, message: '执行操作失败' });
        }
      },
    );
  },
});
