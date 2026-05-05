import { describe, expect, it } from 'vitest';
import {
  FEATURES,
  getAllFeatureKeys,
  getDefaultPageOrder,
  getDefaultVisibleFeatureKeys,
  getFeatureByKey,
} from '../features';

describe('features', () => {
  describe('FEATURES', () => {
    it('should have 6 features defined', () => {
      expect(FEATURES).toHaveLength(6);
    });

    it('should have all required properties for each feature', () => {
      FEATURES.forEach((feature) => {
        expect(feature).toHaveProperty('key');
        expect(feature).toHaveProperty('labelKey');
        expect(feature).toHaveProperty('descriptionKey');
        expect(feature).toHaveProperty('defaultVisible');
        expect(feature).toHaveProperty('components');
        expect(typeof feature.key).toBe('string');
        expect(typeof feature.labelKey).toBe('string');
        expect(typeof feature.descriptionKey).toBe('string');
        expect(typeof feature.defaultVisible).toBe('boolean');
        expect(typeof feature.components).toBe('object');
        expect(feature.components).toHaveProperty('popup');
        expect(feature.components).toHaveProperty('sidepanel');
        expect(feature.components).toHaveProperty('tab');

        // Optional UI properties for non-hidden features
        if (feature.key !== 'dashboard') {
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
      expect(feature?.labelKey).toBe('features:dashboard.title');
    });

    it('should return timestamp feature', () => {
      const feature = getFeatureByKey('timestamp');
      expect(feature).toBeDefined();
      expect(feature?.key).toBe('timestamp');
      expect(feature?.labelKey).toBe('features:timestamp.title');
      expect(feature?.themeColor).toBeDefined();
    });

    it('should return storageCleaner feature', () => {
      const feature = getFeatureByKey('storageCleaner');
      expect(feature).toBeDefined();
      expect(feature?.key).toBe('storageCleaner');
      expect(feature?.labelKey).toBe('features:storageCleaner.title');
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

    it('should include dashboard, timestamp, storageCleaner, qrCode', () => {
      const visibleKeys = getDefaultVisibleFeatureKeys();
      expect(visibleKeys).toContain('dashboard');
      expect(visibleKeys).toContain('timestamp');
      expect(visibleKeys).toContain('storageCleaner');
      expect(visibleKeys).toContain('qrCode');
    });
  });

  describe('getAllFeatureKeys', () => {
    it('should return all feature keys', () => {
      const allKeys = getAllFeatureKeys();
      expect(allKeys).toHaveLength(6);
      expect(allKeys).toContain('dashboard');
      expect(allKeys).toContain('timestamp');
      expect(allKeys).toContain('storageCleaner');
      expect(allKeys).toContain('qrCode');
      expect(allKeys).toContain('textStatistics');
      expect(allKeys).toContain('jwt');
    });
  });

  describe('getDefaultPageOrder', () => {
    it('should exclude dashboard from page order', () => {
      const pageOrder = getDefaultPageOrder();
      expect(pageOrder).not.toContain('dashboard');
    });

    it('should include timestamp, storageCleaner, qrCode in page order', () => {
      const pageOrder = getDefaultPageOrder();
      expect(pageOrder).toContain('timestamp');
      expect(pageOrder).toContain('storageCleaner');
      expect(pageOrder).toContain('qrCode');
    });

    it('should have 5 items in page order', () => {
      const pageOrder = getDefaultPageOrder();
      expect(pageOrder).toHaveLength(5);
    });
  });
});
