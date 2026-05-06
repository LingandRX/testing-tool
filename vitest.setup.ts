import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'zh-CN',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
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

Object.defineProperty(global, 'chrome', {
  value: {
    storage: storageMock,
    tabs: {
      query: vi.fn().mockResolvedValue([]),
      get: vi.fn(),
      sendMessage: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue({}),
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
  },
  writable: true,
});

beforeEach(() => {
  vi.clearAllMocks();
  // Ensure storage mocks return objects even after clearAllMocks
  storageMock.local.get.mockResolvedValue({});
  storageMock.session.get.mockResolvedValue({});
});

afterEach(() => {
  vi.restoreAllMocks();
});
