import { describe, it, expect } from 'vitest';
import {
  FEATURES,
  getFeatureByKey,
  getDefaultVisibleFeatureKeys,
  getAllFeatureKeys,
  getDefaultPageOrder,
} from '../features';

describe('features', () => {
  describe('FEATURES', () => {
    it('should have 9 features defined', () => {
      expect(FEATURES).toHaveLength(9);
    });

    it('should have all required properties for each feature', () => {
      FEATURES.forEach((feature) => {
        expect(feature).toHaveProperty('key');
        expect(feature).toHaveProperty('label');
        expect(feature).toHaveProperty('description');
        expect(feature).toHaveProperty('defaultVisible');
        expect(feature).toHaveProperty('components');
        expect(typeof feature.key).toBe('string');
        expect(typeof feature.label).toBe('string');
        expect(typeof feature.description).toBe('string');
        expect(typeof feature.defaultVisible).toBe('boolean');
        expect(typeof feature.components).toBe('object');
        expect(feature.components).toHaveProperty('popup');
        expect(feature.components).toHaveProperty('sidepanel');
        expect(feature.components).toHaveProperty('tab');

        // Optional UI properties for non-hidden features
        if (feature.key !== 'dashboard' && feature.key !== 'openUrlViewer') {
          expect(feature).toHaveProperty('icon');
          expect(feature).toHaveProperty('themeColor');
          expect(typeof feature.themeColor).toBe('string');
        }
      });
    });

    it('should have unique keys for each feature', () => {
      const keys = FEATURES.map((f) => f.key);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });
  });

  describe('getFeatureByKey', () => {
    it('should return dashboard feature', () => {
      const feature = getFeatureByKey('dashboard');
      expect(feature).toBeDefined();
      expect(feature?.key).toBe('dashboard');
      expect(feature?.label).toBe('Dashboard');
    });

    it('should return timestamp feature', () => {
      const feature = getFeatureByKey('timestamp');
      expect(feature).toBeDefined();
      expect(feature?.key).toBe('timestamp');
      expect(feature?.label).toBe('时间戳');
      expect(feature?.themeColor).toBeDefined();
    });

    it('should return storageCleaner feature', () => {
      const feature = getFeatureByKey('storageCleaner');
      expect(feature).toBeDefined();
      expect(feature?.key).toBe('storageCleaner');
      expect(feature?.label).toBe('存储清理');
    });

    it('should return undefined for invalid key', () => {
      const feature = getFeatureByKey('invalid' as any);
      expect(feature).toBeUndefined();
    });
  });

  describe('getDefaultVisibleFeatureKeys', () => {
    it('should return only visible features', () => {
      const visibleKeys = getDefaultVisibleFeatureKeys();
      visibleKeys.forEach((key) => {
        const feature = getFeatureByKey(key);
        expect(feature?.defaultVisible).toBe(true);
      });
    });

    it('should include dashboard, timestamp, storageCleaner, openUrl', () => {
      const visibleKeys = getDefaultVisibleFeatureKeys();
      expect(visibleKeys).toContain('dashboard');
      expect(visibleKeys).toContain('timestamp');
      expect(visibleKeys).toContain('storageCleaner');
      expect(visibleKeys).toContain('openUrl');
    });

    it('should not include openUrlViewer (not visible by default)', () => {
      const visibleKeys = getDefaultVisibleFeatureKeys();
      expect(visibleKeys).not.toContain('openUrlViewer');
    });
  });

  describe('getAllFeatureKeys', () => {
    it('should return all feature keys', () => {
      const allKeys = getAllFeatureKeys();
      expect(allKeys).toHaveLength(9);
      expect(allKeys).toContain('dashboard');
      expect(allKeys).toContain('timestamp');
      expect(allKeys).toContain('storageCleaner');
      expect(allKeys).toContain('openUrl');
      expect(allKeys).toContain('qrCode');
      expect(allKeys).toContain('formRecognizer');
      expect(allKeys).toContain('openUrlViewer');
    });
  });

  describe('getDefaultPageOrder', () => {
    it('should exclude dashboard from page order', () => {
      const pageOrder = getDefaultPageOrder();
      expect(pageOrder).not.toContain('dashboard');
    });

    it('should exclude openUrlViewer from page order', () => {
      const pageOrder = getDefaultPageOrder();
      expect(pageOrder).not.toContain('openUrlViewer');
    });

    it('should include timestamp, storageCleaner, openUrl, qrCode, formRecognizer in page order', () => {
      const pageOrder = getDefaultPageOrder();
      expect(pageOrder).toContain('timestamp');
      expect(pageOrder).toContain('storageCleaner');
      expect(pageOrder).toContain('openUrl');
      expect(pageOrder).toContain('qrCode');
      expect(pageOrder).toContain('formRecognizer');
    });

    it('should have 7 items in page order', () => {
      const pageOrder = getDefaultPageOrder();
      expect(pageOrder).toHaveLength(7);
    });
  });
});
