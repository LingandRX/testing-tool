import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Index from '../index';

// Mock the chrome APIs
vi.mock('@/utils/chromeStorage', () => ({
  storageUtil: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/utils/storageCleaner', () => ({
  getCurrentTab: vi.fn().mockResolvedValue({ id: 1, url: 'https://example.com' }),
  getCookieSize: vi.fn().mockResolvedValue(0),
  getLocalStorageSize: vi.fn().mockResolvedValue(0),
  getSessionStorageSize: vi.fn().mockResolvedValue(0),
  getOriginStorageEstimate: vi.fn().mockResolvedValue(0),
  getCacheStorageSize: vi.fn().mockResolvedValue(0),
  getServiceWorkerCount: vi.fn().mockResolvedValue(0),
  clearStorage: vi.fn().mockResolvedValue({ overallSuccess: true }),
  formatCleaningResult: vi.fn().mockReturnValue('Cleaned successfully'),
}));

describe('StorageCleaner 页面', () => {
  it('应该渲染初始化加载状态', () => {
    // storageCleaner:initializing 的中文文案为「正在读取站点数据...」
    render(<Index />);
    expect(screen.getByText(/正在读取站点数据/)).toBeInTheDocument();
  });
});
