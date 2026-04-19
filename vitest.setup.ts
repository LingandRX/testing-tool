import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach } from 'vitest';

const storageMock = {
  local: {
    get: vi.fn(),
    set: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
  },
  session: {
    get: vi.fn(),
    set: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
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
});

afterEach(() => {
  vi.restoreAllMocks();
});