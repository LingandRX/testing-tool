import type { PageType } from '@/types/storage';

export interface ContextMenuItemConfig {
  id: string;
  title: string;
  contexts: [`${chrome.contextMenus.ContextType}`, ...`${chrome.contextMenus.ContextType}`[]];
  parentId?: string;
}

export interface ContextMenuClickedInfo {
  featureKey: PageType;
  payload: string;
}

export interface ParseResult {
  success: boolean;
  data?: ContextMenuClickedInfo;
  error?: string;
}

const PARENT_MENU_ID = 'testing-tools-parent';

export const MAX_PAYLOAD_LENGTH = 10000;

export const CONTEXT_MENU_CONFIGS: ContextMenuItemConfig[] = [
  {
    id: PARENT_MENU_ID,
    title: 'Testing Tools',
    contexts: [chrome.contextMenus.ContextType.ALL],
  },
  {
    id: 'jwt',
    title: '🔑 解析 JWT',
    contexts: [chrome.contextMenus.ContextType.SELECTION],
    parentId: PARENT_MENU_ID,
  },
  {
    id: 'base64Converter',
    title: '🔄 Base64 解码',
    contexts: [chrome.contextMenus.ContextType.SELECTION],
    parentId: PARENT_MENU_ID,
  },
  {
    id: 'textStatistics',
    title: '📊 统计选中文本',
    contexts: [chrome.contextMenus.ContextType.SELECTION],
    parentId: PARENT_MENU_ID,
  },
  {
    id: 'timestamp',
    title: '⏰ 转换时间戳',
    contexts: [chrome.contextMenus.ContextType.SELECTION],
    parentId: PARENT_MENU_ID,
  },
  {
    id: 'storageCleaner',
    title: '🧹 清理当前网站存储',
    contexts: [chrome.contextMenus.ContextType.PAGE],
    parentId: PARENT_MENU_ID,
  },
  {
    id: 'qrCode-page',
    title: '🔗 网页链接转二维码',
    contexts: [chrome.contextMenus.ContextType.PAGE],
    parentId: PARENT_MENU_ID,
  },
];

export function createAllContextMenus(): void {
  for (const config of CONTEXT_MENU_CONFIGS) {
    chrome.contextMenus.create({
      id: config.id,
      title: config.title,
      contexts: config.contexts,
      parentId: config.parentId,
    });
  }
}

export function parseContextMenuClick(
  menuItemId: string,
  info: chrome.contextMenus.OnClickData,
): ParseResult {
  const featureKey = menuItemId as PageType;

  if (menuItemId === 'qrCode-page') {
    return {
      success: true,
      data: { featureKey: 'qrCode', payload: info.pageUrl || '' },
    };
  }

  if (info.selectionText) {
    const text = info.selectionText;

    if (text.length > MAX_PAYLOAD_LENGTH) {
      return {
        success: true,
        data: { featureKey, payload: text.substring(0, MAX_PAYLOAD_LENGTH) },
      };
    }

    return {
      success: true,
      data: { featureKey, payload: text },
    };
  }

  if (info.pageUrl) {
    return {
      success: true,
      data: { featureKey, payload: info.pageUrl },
    };
  }

  return { success: false, error: '无法获取有效数据' };
}
