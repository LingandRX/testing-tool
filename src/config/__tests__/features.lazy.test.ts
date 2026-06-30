import { beforeEach, describe, expect, it, vi } from 'vitest';

const pageLoadTracker = vi.hoisted(() => ({
  loaded: [] as string[],
}));

vi.mock('@/pages/Dashboard', () => {
  pageLoadTracker.loaded.push('Dashboard');
  return { default: () => null };
});
vi.mock('@/pages/Timestamp', () => {
  pageLoadTracker.loaded.push('Timestamp');
  return { default: () => null };
});
vi.mock('@/pages/StorageCleaner', () => {
  pageLoadTracker.loaded.push('StorageCleaner');
  return { default: () => null };
});
vi.mock('@/pages/QrCode', () => {
  pageLoadTracker.loaded.push('QrCode');
  return { default: () => null };
});
vi.mock('@/pages/TextStatistics', () => {
  pageLoadTracker.loaded.push('TextStatistics');
  return { default: () => null };
});
vi.mock('@/pages/Jwt', () => {
  pageLoadTracker.loaded.push('Jwt');
  return { default: () => null };
});
vi.mock('@/pages/JsonTools', () => {
  pageLoadTracker.loaded.push('JsonTools');
  return { default: () => null };
});
vi.mock('@/pages/Base64Converter', () => {
  pageLoadTracker.loaded.push('Base64Converter');
  return { default: () => null };
});
vi.mock('@/pages/RightClickRestorer', () => {
  pageLoadTracker.loaded.push('RightClickRestorer');
  return { default: () => null };
});
vi.mock('@/pages/TestDataGenerator', () => {
  pageLoadTracker.loaded.push('TestDataGenerator');
  return { default: () => null };
});

describe('features 懒加载', () => {
  beforeEach(() => {
    pageLoadTracker.loaded.length = 0;
    vi.resetModules();
  });

  it('仅导入工具函数时不应加载任何页面模块', async () => {
    const { getAllFeatureKeys, getDefaultPageOrder } = await import('@/config/features');

    getAllFeatureKeys();
    getDefaultPageOrder();

    expect(pageLoadTracker.loaded).toEqual([]);
  });

  it('访问 FEATURES 元数据时不应加载任何页面模块', async () => {
    const { FEATURES } = await import('@/config/features');

    expect(FEATURES).toHaveLength(10);
    expect(pageLoadTracker.loaded).toEqual([]);
  });

  it('loadPage 应仅加载对应页面模块', async () => {
    const { loadPage } = await import('@/config/pageLoaders/index');

    await loadPage('dashboard');

    expect(pageLoadTracker.loaded).toEqual(['Dashboard']);
  });

  it('loadPage 切换页面时不应加载无关页面模块', async () => {
    const { loadPage } = await import('@/config/pageLoaders/index');

    await loadPage('timestamp');

    expect(pageLoadTracker.loaded).toEqual(['Timestamp']);
    expect(pageLoadTracker.loaded).not.toContain('QrCode');
    expect(pageLoadTracker.loaded).not.toContain('TestDataGenerator');
  });
});
