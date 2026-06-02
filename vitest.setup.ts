import '@testing-library/jest-dom';
import { afterEach, beforeEach, vi } from 'vitest';
import React from 'react';
import zhMessages from './public/_locales/zh_CN/messages.json';

// Type assertion to allow string indexing
const zhMessagesMap = zhMessages as Record<string, { message: string }>;

vi.mock('@/utils/chromeI18n', () => ({
  useI18n: (ns?: string | string[]) => ({
    t: (key: string) => {
      let msgId = key;
      // Handle namespace:key format
      if (key.includes(':')) {
        msgId = key.replace(':', '_').replace(/\./g, '_');
      }
      // Try direct key first
      if (zhMessagesMap[msgId]) return zhMessagesMap[msgId].message;
      // Try namespace prefix (using converted msgId)
      if (ns) {
        const namespaces = Array.isArray(ns) ? ns : [ns];
        for (const n of namespaces) {
          const candidate = `${n}_${msgId}`;
          if (zhMessagesMap[candidate]) return zhMessagesMap[candidate].message;
        }
      }
      return msgId;
    },
    i18n: {
      changeLanguage: vi.fn().mockResolvedValue(undefined),
      language: 'zh',
    },
    isLoaded: true,
  }),
  getMessage: (msgId: string) => zhMessagesMap[msgId]?.message ?? msgId,
  getLanguage: () => 'zh',
  preloadNamespaces: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/components/CopyButton', () => ({
  CopyButton: ({
    text,
    tooltip,
    onClick,
  }: {
    text: string;
    tooltip?: string;
    onClick?: (e: React.MouseEvent) => void;
  }) =>
    React.createElement(
      'button',
      {
        'aria-label': tooltip || 'copy',
        type: 'button',
        onClick: async (e: React.MouseEvent) => {
          if (text) {
            try {
              await navigator.clipboard.writeText(text);
            } catch {
              // 与真实 CopyButton 行为一致：失败时静默处理
            }
          }
          onClick?.(e);
        },
      },
      'Copy',
    ),
}));

vi.mock('@/components/CopyButton', () => ({
  CopyButton: ({
    text,
    tooltip,
    onClick,
  }: {
    text: string;
    tooltip?: string;
    onClick?: (e: React.MouseEvent) => void;
  }) =>
    React.createElement(
      'button',
      {
        'aria-label': tooltip || 'copy',
        type: 'button',
        onClick: async (e: React.MouseEvent) => {
          if (text) {
            try {
              await navigator.clipboard.writeText(text);
            } catch {
              // 与真实 CopyButton 行为一致：失败时静默处理
            }
          }
          onClick?.(e);
        },
      },
      'Copy',
    ),
}));

const storageMock = {
  local: {
    get: vi.fn().mockImplementation(() => Promise.resolve({})),
    set: vi.fn().mockImplementation(() => Promise.resolve()),
    remove: vi.fn().mockImplementation(() => Promise.resolve()),
    clear: vi.fn().mockImplementation(() => Promise.resolve()),
  },
  session: {
    get: vi.fn().mockImplementation(() => Promise.resolve({})),
    set: vi.fn().mockImplementation(() => Promise.resolve()),
    remove: vi.fn().mockImplementation(() => Promise.resolve()),
    clear: vi.fn().mockImplementation(() => Promise.resolve()),
  },
  onChanged: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
    hasListener: vi.fn(),
  },
};

const webExtensionMock = {
  storage: storageMock,
  tabs: {
    query: vi.fn().mockResolvedValue([]),
    get: vi.fn().mockResolvedValue({}),
    sendMessage: vi.fn().mockResolvedValue(undefined),
    create: vi.fn().mockResolvedValue({}),
    reload: vi.fn().mockResolvedValue(undefined),
  },
  runtime: {
    id: 'test-extension-id',
    getURL: vi.fn((path: string) => `chrome-extension://test-extension-id/${path}`),
    openOptionsPage: vi.fn(),
    onInstalled: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  action: {
    onClicked: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    openPopup: vi.fn().mockResolvedValue(undefined),
  },
  sidePanel: {
    open: vi.fn().mockResolvedValue(undefined),
  },
  scripting: {
    executeScript: vi.fn().mockResolvedValue([{ result: undefined }]),
  },
  cookies: {
    getAll: vi.fn().mockResolvedValue([]),
    remove: vi.fn().mockResolvedValue(undefined),
  },
  contextMenus: {
    create: vi.fn(),
    onClicked: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    ContextType: {
      ALL: 'all',
      PAGE: 'page',
      FRAME: 'frame',
      SELECTION: 'selection',
      LINK: 'link',
      EDITABLE: 'editable',
      IMAGE: 'image',
      VIDEO: 'video',
      AUDIO: 'audio',
      LAUNCHER: 'launcher',
      BROWSER_ACTION: 'browser_action',
      PAGE_ACTION: 'page_action',
      ACTION: 'action',
    },
  },
};

Object.defineProperty(globalThis, 'chrome', { value: webExtensionMock, writable: true });
Object.defineProperty(globalThis, 'browser', { value: webExtensionMock, writable: true });

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'chrome', { value: webExtensionMock, writable: true });
  Object.defineProperty(window, 'browser', { value: webExtensionMock, writable: true });
}

beforeEach(() => {
  vi.clearAllMocks();
  storageMock.local.get.mockResolvedValue({});
  storageMock.session.get.mockResolvedValue({});
});

afterEach(() => {
  vi.restoreAllMocks();
});

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});
