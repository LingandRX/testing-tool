import '@testing-library/jest-dom';
import { afterEach, beforeEach, vi } from 'vitest';
import React from 'react';

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
    onActivated: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onUpdated: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  windows: {
    onFocusChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
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
