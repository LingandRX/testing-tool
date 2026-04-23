import { FormFieldInfo, FillMode } from './dummyDataGenerator';

/**
 * 消息动作类型
 */
export enum MessageAction {
  // 标签页操作
  RELOAD_TAB = 'reloadTab',

  // 表单相关操作
  SCAN_FORM_FIELDS = 'scanFormFields',
  FILL_VALID_DATA = 'fillValidData',
  FILL_INVALID_DATA = 'fillInvalidData',
  FILL_SELECTED_FIELDS = 'fillSelectedFields',
  CLEAR_ALL_FIELDS = 'clearAllFields',

  // 字段高亮操作
  HIGHLIGHT_FIELD = 'highlightField',
  UNHIGHLIGHT_FIELD = 'unhighlightField',
  HIGHLIGHT_ALL_FIELDS = 'highlightAllFields',
  UNHIGHLIGHT_ALL_FIELDS = 'unhighlightAllFields',
}

/**
 * 消息载荷接口
 */
export interface MessagePayload {
  action: MessageAction | string;
  tabId?: number;
  delay?: number;
  fields?: Omit<FormFieldInfo, 'element'>[];
  mode?: FillMode;
  includeHidden?: boolean;
  fieldId?: string;
  fieldIds?: string[];
}

/**
 * 消息响应接口
 */
export interface MessageResponse {
  success: boolean;
  message?: string;
  fields?: Omit<FormFieldInfo, 'element'>[];
  totalCount?: number;
  validCount?: number;
  hasModal?: boolean;
}

/**
 * 发送消息到内容脚本
 */
export async function sendMessageToContent(
  action: MessageAction,
  payload?: Omit<MessagePayload, 'action'>,
): Promise<MessageResponse> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      return { success: false, message: '无法获取当前标签页' };
    }

    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tab.id!, { action, ...payload }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('消息发送失败:', chrome.runtime.lastError);
          resolve({ success: false, message: '无法连接到页面，请确保页面已加载' });
        } else {
          resolve((response as MessageResponse) || { success: false, message: '未收到响应' });
        }
      });
    });
  } catch (error) {
    console.error('获取标签页失败:', error);
    return { success: false, message: '无法获取当前标签页' };
  }
}

/**
 * 注入内容脚本
 */
export async function injectContentScript(): Promise<boolean> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      return false;
    }

    // 尝试注入内容脚本
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['/content-scripts/content.js'],
    });
    return true;
  } catch (error) {
    console.error('注入内容脚本失败:', error);
    return false;
  }
}
