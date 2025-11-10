import '@testing-library/jest-dom';
import { vi } from 'vitest';

// 模拟 chrome storage API
Object.defineProperty(global, 'chrome', {
  value: {
    storage: {
      local: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
      },
    },
  },
  writable: true,
});

// 模拟 navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
  writable: true,
});
