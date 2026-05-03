import { defineExtensionMessaging } from '@webext-core/messaging';

export enum MessageAction {
  RELOAD_TAB = 'reloadTab',
  SIDE_PANEL_STATE_CHANGED = 'sidePanelStateChanged',
}

export interface MessageResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ProtocolMap {
  [MessageAction.RELOAD_TAB](data: { tabId: number; delay?: number }): MessageResponse;
  [MessageAction.SIDE_PANEL_STATE_CHANGED](data: { isOpen: boolean }): void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();

export async function sendMessageToContent<K extends keyof ProtocolMap>(
  action: K,
  ...args: Parameters<ProtocolMap[K]>[0] extends undefined
    ? []
    : [data: Parameters<ProtocolMap[K]>[0]]
): Promise<ReturnType<ProtocolMap[K]>> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      console.warn(`[Messaging] 无法获取当前标签页，无法发送动作: ${action}`);
      return { success: false, message: '无法获取当前标签页' } as ReturnType<ProtocolMap[K]>;
    }

    const data = args.length > 0 ? args[0] : undefined;

    const response = await (
      sendMessage as (
        type: K,
        data: Parameters<ProtocolMap[K]>[0],
        arg?: number,
      ) => Promise<ReturnType<ProtocolMap[K]>>
    )(action, data as Parameters<ProtocolMap[K]>[0], tab.id);

    return response;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Messaging] 向内容脚本发送消息失败 [Action: ${action}]:`, errorMsg);

    if (errorMsg.includes('Could not establish connection')) {
      return { success: false, message: '无法连接到网页，请刷新页面后再试' } as ReturnType<
        ProtocolMap[K]
      >;
    }
    if (errorMsg.includes('No response')) {
      return { success: false, message: '网页响应超时，请重试' } as ReturnType<ProtocolMap[K]>;
    }

    return { success: false, message: `通信失败: ${errorMsg}` } as ReturnType<ProtocolMap[K]>;
  }
}
