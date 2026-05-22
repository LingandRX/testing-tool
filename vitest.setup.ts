import '@testing-library/jest-dom';
import { afterEach, beforeEach, vi } from 'vitest';

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
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn().mockResolvedValue(undefined),
  },
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
