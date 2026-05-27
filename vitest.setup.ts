import '@testing-library/jest-dom';
import { afterEach, beforeEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import React from 'react';

// 读取中文翻译文件用于 withTranslation mock
const zhCommon = JSON.parse(
  readFileSync(resolve(__dirname, 'i18n/locales/zh/common.json'), 'utf-8'),
);

// 支持嵌套 key 查找，如 "errorBoundary.title" → zhCommon.errorBoundary.title
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function nestedLookup(obj: Record<string, any>, key: string): string | undefined {
  const parts = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[part];
  }
  return typeof current === 'string' ? current : undefined;
}

vi.mock('@/utils/useLazyTranslation', () => ({
  useLazyTranslation: (ns?: string) => ({
    // 自动承接命名空间前缀过滤，100% 模拟真实多语种直出
    t: (key: string) => (ns ? `${ns}:${key}` : key),
    i18n: {
      changeLanguage: vi.fn().mockResolvedValue(undefined),
      language: 'zh-CN',
    },
    isLoaded: true,
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn().mockResolvedValue(undefined),
      language: 'zh-CN',
    },
  }),
  withTranslation: (ns?: string) => {
    const translations = ns === 'common' ? zhCommon : {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (Component: React.ComponentType<any>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Wrapped = (props: any) =>
        React.createElement(Component, {
          ...props,
          t: (key: string) => nestedLookup(translations, key) || key,
          i18n: { language: 'zh-CN', changeLanguage: vi.fn() },
        });
      Wrapped.displayName = `withTranslation(${Component.displayName || Component.name || 'Component'})`;
      return Wrapped;
    };
  },
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn().mockResolvedValue(undefined),
  },
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
    reload: vi.fn().mockResolvedValue(undefined), // ✅ 承接 MessageAction.RELOAD_TAB 刷新单元测试
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
  alarms: {
    create: vi.fn().mockResolvedValue(undefined),
    onAlarm: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
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

// 全局 matchMedia 极客级环境模拟（ThemeModeProvider 依赖）
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
