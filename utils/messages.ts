import { FormFieldInfo, FillMode } from './dummyDataGenerator';
import { defineExtensionMessaging } from '@webext-core/messaging';

/**
 * 字段数据接口（用于消息传递）
 */
export interface MessageFieldData extends Omit<FormFieldInfo, 'element'> {
  useInvalidData?: boolean;
}

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

  // 字段定位/闪烁
  FLASH_FIELD = 'flashField',

  // 智能表单注入
  FORM_INJECT = 'FORM_INJECT',

  // 侧边栏状态变化
  SIDE_PANEL_STATE_CHANGED = 'sidePanelStateChanged',
}

/**
 * 消息载荷接口 (保留兼容性)
 */
export interface MessagePayload {
  action: MessageAction | string;
  tabId?: number;
  delay?: number;
  fields?: MessageFieldData[];
  mode?: FillMode;
  includeHidden?: boolean;
  fieldId?: string;
  fieldIds?: string[];
  data?: unknown;
  isOpen?: boolean;
}

/**
 * 消息响应接口
 */
export interface FormInjectItem {
  entry: import('@/types/storage').FormMapEntry;
  mockValue: string;
}

export interface FormInjectResult {
  id: string;
  success: boolean;
}

export interface MessageResponse {
  success: boolean;
  message?: string;
  fields?: Omit<FormFieldInfo, 'element'>[];
  totalCount?: number;
  validCount?: number;
  hasModal?: boolean;
  results?: FormInjectResult[];
  error?: string;
}

/**
 * 协议映射定义（用于类型安全的消息通信）
 */
export interface ProtocolMap {
  // 基础消息格式，用于逐步迁移
  [MessageAction.RELOAD_TAB](data: { tabId: number; delay?: number }): MessageResponse;
  [MessageAction.SCAN_FORM_FIELDS](): MessageResponse;
  [MessageAction.FILL_VALID_DATA](data: { includeHidden?: boolean }): MessageResponse;
  [MessageAction.FILL_INVALID_DATA](data: { includeHidden?: boolean }): MessageResponse;
  [MessageAction.FILL_SELECTED_FIELDS](data: {
    fields: MessageFieldData[];
    mode?: FillMode;
    includeHidden?: boolean;
  }): MessageResponse;
  [MessageAction.CLEAR_ALL_FIELDS](): MessageResponse;
  [MessageAction.HIGHLIGHT_FIELD](data: { fieldId: string }): MessageResponse;
  [MessageAction.UNHIGHLIGHT_FIELD](data: { fieldId: string }): MessageResponse;
  [MessageAction.HIGHLIGHT_ALL_FIELDS](data: { fieldIds: string[] }): MessageResponse;
  [MessageAction.UNHIGHLIGHT_ALL_FIELDS](): MessageResponse;
  [MessageAction.FLASH_FIELD](data: { fieldId: string }): MessageResponse;
  [MessageAction.FORM_INJECT](data: { data: FormInjectItem[] }): MessageResponse;
  [MessageAction.SIDE_PANEL_STATE_CHANGED](data: { isOpen: boolean }): void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();

/**
 * 发送消息到内容脚本 (旧版包装器，内部使用新机制)
 * @deprecated 建议直接使用 sendMessage
 */
type ProtocolData<K extends keyof ProtocolMap> = Parameters<ProtocolMap[K]>[0];
type ProtocolReturn<K extends keyof ProtocolMap> = ReturnType<ProtocolMap[K]>;

export async function sendMessageToContent<K extends keyof ProtocolMap>(
  action: K,
  ...args: ProtocolData<K> extends undefined ? [] : [data: ProtocolData<K>]
): Promise<ProtocolReturn<K>> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      return { success: false, message: '无法获取当前标签页' } as ProtocolReturn<K>;
    }

    const data = args.length > 0 ? args[0] : undefined;
    return await (
      sendMessage as (type: K, data: ProtocolData<K>, arg?: number) => Promise<ProtocolReturn<K>>
    )(action, data as ProtocolData<K>, tab.id);
  } catch (error) {
    console.error('发送消息失败:', error);
    return { success: false, message: '发送消息失败' } as ProtocolReturn<K>;
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
