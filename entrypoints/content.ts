import '../.wxt/types/imports.d.ts';
import {
  fillAllFields,
  clearAllFields,
  fillSelectedFields,
  scanFormFields,
  highlightField,
  unhighlightField,
  FillMode,
  type FormFieldInfo,
} from '@/utils/dummyDataGenerator';

// 存储当前扫描到的字段列表，用于高亮联动
let currentFields: FormFieldInfo[] = [];

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_end',
  main() {
    // 监听来自 popup/sidepanel 的消息
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      try {
        switch (message.action) {
          case 'scanFormFields': {
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
          case 'fillValidData':
            fillAllFields(FillMode.VALID, message.includeHidden || false);
            sendResponse({ success: true, message: '已填充有效数据' });
            break;
          case 'fillInvalidData':
            fillAllFields(FillMode.INVALID, message.includeHidden || false);
            sendResponse({ success: true, message: '已填充无效数据' });
            break;
          case 'fillSelectedFields': {
            const fields = message.fields as FormFieldInfo[];
            const count = fillSelectedFields(fields, message.mode || FillMode.VALID);
            sendResponse({ success: true, message: `已填充 ${count} 个字段` });
            break;
          }
          case 'clearAllFields':
            clearAllFields();
            sendResponse({ success: true, message: '已清空所有字段' });
            break;
          case 'highlightField': {
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
          case 'unhighlightField': {
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
          case 'highlightAllFields': {
            const fieldIds = message.fieldIds as string[];
            fieldIds.forEach((id) => {
              const field = currentFields.find((f) => f.id === id);
              if (field) {
                highlightField(field.element);
              }
            });
            sendResponse({ success: true });
            break;
          }
          case 'unhighlightAllFields':
            currentFields.forEach((field) => {
              unhighlightField(field.element);
            });
            sendResponse({ success: true });
            break;
          default:
            sendResponse({ success: false, message: '未知操作' });
        }
      } catch (error) {
        console.error('执行操作失败:', error);
        sendResponse({ success: false, message: '执行操作失败' });
      }
    });
  },
});
