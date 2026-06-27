import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as featureConfig from '@/config/features';
import { resolveDashboardFeatures } from '../dashboardFeatures';

describe('resolveDashboardFeatures', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('应按 keys 顺序返回可见工具，并排除 dashboard', () => {
    const items = resolveDashboardFeatures(['jwt', 'timestamp'], ['dashboard', 'timestamp', 'jwt']);

    expect(items.map((item) => item.key)).toEqual(['jwt', 'timestamp']);
    expect(items.map((item) => item.feature.label)).toEqual(['JWT 解析', '时间戳']);
  });

  it('缺少 themeColorKey 但有 icon 的工具仍应显示', () => {
    const originalGetFeatureByKey = featureConfig.getFeatureByKey;
    vi.spyOn(featureConfig, 'getFeatureByKey').mockImplementation((key) => {
      const feature = originalGetFeatureByKey(key);
      if (key === 'timestamp' && feature) {
        return { ...feature, themeColorKey: undefined };
      }
      return feature;
    });

    const items = resolveDashboardFeatures(['timestamp'], ['dashboard', 'timestamp']);

    expect(items.map((item) => item.key)).toEqual(['timestamp']);
  });

  it('应过滤不在 visiblePages 中的工具', () => {
    const items = resolveDashboardFeatures(['jwt', 'timestamp'], ['dashboard', 'timestamp']);

    expect(items.map((item) => item.key)).toEqual(['timestamp']);
  });

  it('visiblePages 无匹配工具时应返回空列表', () => {
    const items = resolveDashboardFeatures(['jwt', 'timestamp'], ['dashboard']);

    expect(items).toEqual([]);
  });

  it('应过滤缺少 icon 的工具', () => {
    const items = resolveDashboardFeatures(['dashboard', 'timestamp'], ['dashboard', 'timestamp']);

    expect(items.map((item) => item.key)).toEqual(['timestamp']);
  });
});
