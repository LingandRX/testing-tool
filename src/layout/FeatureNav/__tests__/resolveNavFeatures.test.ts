import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as featureConfig from '@/config/features';
import { resolveNavFeatures } from '../resolveNavFeatures';

describe('resolveNavFeatures', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('应按 keys 顺序返回可见工具', () => {
    const items = resolveNavFeatures(['jwt', 'timestamp'], ['timestamp', 'jwt']);

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

    const items = resolveNavFeatures(['timestamp'], ['timestamp']);

    expect(items.map((item) => item.key)).toEqual(['timestamp']);
  });

  it('应过滤不在 visiblePages 中的工具', () => {
    const items = resolveNavFeatures(['jwt', 'timestamp'], ['timestamp']);

    expect(items.map((item) => item.key)).toEqual(['timestamp']);
  });

  it('visiblePages 无匹配工具时应返回空列表', () => {
    const items = resolveNavFeatures(['jwt', 'timestamp'], []);

    expect(items).toEqual([]);
  });

  it('应过滤缺少 icon 的工具', () => {
    const originalGetFeatureByKey = featureConfig.getFeatureByKey;
    vi.spyOn(featureConfig, 'getFeatureByKey').mockImplementation((key) => {
      const feature = originalGetFeatureByKey(key);
      if (key === 'jwt' && feature) {
        return { ...feature, icon: undefined };
      }
      return feature;
    });

    const items = resolveNavFeatures(['jwt', 'timestamp'], ['jwt', 'timestamp']);

    expect(items.map((item) => item.key)).toEqual(['timestamp']);
  });
});
