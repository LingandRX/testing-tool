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

  it('渲染 lazy 组件时才应加载对应页面模块', async () => {
    const React = await import('react');
    const { render, waitFor } = await import('@testing-library/react');
    const { FEATURES } = await import('@/config/features');

    const DashboardPage = FEATURES.find((f) => f.key === 'dashboard')!.components.popup;

    render(
      React.createElement(React.Suspense, { fallback: null }, React.createElement(DashboardPage)),
    );

    await waitFor(() => {
      expect(pageLoadTracker.loaded).toEqual(['Dashboard']);
    });
  });
});
