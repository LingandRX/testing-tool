import { describe, expect, it } from 'vitest';
import {
  FEATURES,
  getAllFeatureKeys,
  getDefaultPageOrder,
  getDefaultVisibleFeatureKeys,
  getFeatureByKey,
  getPopupHeight,
} from '@/config/features';

describe('features', () => {
  describe('FEATURES', () => {
    it('应该有9个功能定义', () => {
      expect(FEATURES).toHaveLength(9);
    });

    it('应该有每个功能的所有必需属性', () => {
      FEATURES.forEach((feature) => {
        expect(feature).toHaveProperty('key');
        expect(feature).toHaveProperty('label');
        expect(feature).toHaveProperty('description');
        expect(feature).toHaveProperty('defaultVisible');
        expect(feature).not.toHaveProperty('component');
        expect(typeof feature.key).toBe('string');
        expect(typeof feature.label).toBe('string');
        expect(typeof feature.description).toBe('string');
        expect(typeof feature.defaultVisible).toBe('boolean');
        expect(feature).toHaveProperty('icon');
        expect(feature).toHaveProperty('themeColorKey');
        expect(typeof feature.themeColorKey).toBe('string');
      });
    });

    it('应该有每个功能的唯一key', () => {
      const keys = FEATURES.map((f) => f.key);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });
  });

  describe('getFeatureByKey', () => {
    it('应该返回时间戳功能', () => {
      const feature = getFeatureByKey('timestamp');
      expect(feature).toBeDefined();
      expect(feature?.key).toBe('timestamp');
      expect(feature?.label).toBe('时间戳');
      expect(feature?.themeColorKey).toBeDefined();
    });

    it('应该返回存储清理功能', () => {
      const feature = getFeatureByKey('storageCleaner');
      expect(feature).toBeDefined();
      expect(feature?.key).toBe('storageCleaner');
      expect(feature?.label).toBe('存储清理');
    });

    it('应该返回undefined用于无效的key', () => {
      const feature = getFeatureByKey('invalid' as any);
      expect(feature).toBeUndefined();
    });
  });

  describe('getDefaultVisibleFeatureKeys', () => {
    it('应该返回仅可见的功能', () => {
      const visibleKeys = getDefaultVisibleFeatureKeys();
      visibleKeys.forEach((key) => {
        const feature = getFeatureByKey(key);
        expect(feature?.defaultVisible).toBe(true);
      });
    });

    it('应该包含时间戳、存储清理、二维码', () => {
      const visibleKeys = getDefaultVisibleFeatureKeys();
      expect(visibleKeys).toContain('timestamp');
      expect(visibleKeys).toContain('storageCleaner');
      expect(visibleKeys).toContain('qrCode');
    });
  });

  describe('getAllFeatureKeys', () => {
    it('应该返回所有功能key', () => {
      const allKeys = getAllFeatureKeys();
      expect(allKeys).toHaveLength(9);
      expect(allKeys).toContain('timestamp');
      expect(allKeys).toContain('storageCleaner');
      expect(allKeys).toContain('qrCode');
      expect(allKeys).toContain('textStatistics');
      expect(allKeys).toContain('jwt');
      expect(allKeys).toContain('jsonTools');
      expect(allKeys).toContain('base64Converter');
      expect(allKeys).toContain('rightClickRestorer');
      expect(allKeys).toContain('testDataGenerator');
    });
  });

  describe('getDefaultPageOrder', () => {
    it('应该包含所有工具页面', () => {
      const pageOrder = getDefaultPageOrder();
      expect(pageOrder).toHaveLength(9);
    });

    it('应该包含时间戳、存储清理、二维码在页面顺序', () => {
      const pageOrder = getDefaultPageOrder();
      expect(pageOrder).toContain('timestamp');
      expect(pageOrder).toContain('storageCleaner');
      expect(pageOrder).toContain('qrCode');
    });
  });

  describe('getPopupHeight', () => {
    it('应该返回时间戳页面的配置高度', () => {
      expect(getPopupHeight('timestamp')).toBe(480);
    });

    it('应该返回右键恢复页面的配置高度', () => {
      expect(getPopupHeight('rightClickRestorer')).toBe(420);
    });

    it('应该返回JSON工具页面的配置高度', () => {
      expect(getPopupHeight('jsonTools')).toBe(600);
    });

    it('应该针对未知页面返回默认高度600且不超出边界', () => {
      expect(getPopupHeight('unknown' as any)).toBe(600);
    });
  });
});
