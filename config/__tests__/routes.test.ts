import { describe, it, expect } from 'vitest';
import {
  ROUTES,
  getRouteByKey,
  getDefaultVisibleRoutes,
  getAllRouteKeys,
  getDefaultPageOrder,
} from '../routes';

describe('routes', () => {
  describe('ROUTES', () => {
    it('should have 5 routes defined', () => {
      expect(ROUTES).toHaveLength(5);
    });

    it('should have all required properties for each route', () => {
      ROUTES.forEach((route) => {
        expect(route).toHaveProperty('key');
        expect(route).toHaveProperty('label');
        expect(route).toHaveProperty('defaultVisible');
        expect(route).toHaveProperty('component');
        expect(typeof route.key).toBe('string');
        expect(typeof route.label).toBe('string');
        expect(typeof route.defaultVisible).toBe('boolean');
        expect(typeof route.component).toBe('function');
      });
    });

    it('should have unique keys for each route', () => {
      const keys = ROUTES.map((route) => route.key);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });
  });

  describe('getRouteByKey', () => {
    it('should return dashboard route', () => {
      const route = getRouteByKey('dashboard');
      expect(route).toBeDefined();
      expect(route?.key).toBe('dashboard');
      expect(route?.label).toBe('Dashboard');
    });

    it('should return timestamp route', () => {
      const route = getRouteByKey('timestamp');
      expect(route).toBeDefined();
      expect(route?.key).toBe('timestamp');
      expect(route?.label).toBe('时间戳');
    });

    it('should return storageCleaner route', () => {
      const route = getRouteByKey('storageCleaner');
      expect(route).toBeDefined();
      expect(route?.key).toBe('storageCleaner');
      expect(route?.label).toBe('存储清理');
    });

    it('should return openUrl route', () => {
      const route = getRouteByKey('openUrl');
      expect(route).toBeDefined();
      expect(route?.key).toBe('openUrl');
      expect(route?.label).toBe('Open Url');
    });

    it('should return openUrlViewer route', () => {
      const route = getRouteByKey('openUrlViewer');
      expect(route).toBeDefined();
      expect(route?.key).toBe('openUrlViewer');
      expect(route?.label).toBe('查看');
    });

    it('should return undefined for invalid key', () => {
      const route = getRouteByKey('invalid' as any);
      expect(route).toBeUndefined();
    });
  });

  describe('getDefaultVisibleRoutes', () => {
    it('should return only visible routes', () => {
      const visibleRoutes = getDefaultVisibleRoutes();
      visibleRoutes.forEach((key) => {
        const route = getRouteByKey(key);
        expect(route?.defaultVisible).toBe(true);
      });
    });

    it('should include dashboard, timestamp, storageCleaner, openUrl', () => {
      const visibleRoutes = getDefaultVisibleRoutes();
      expect(visibleRoutes).toContain('dashboard');
      expect(visibleRoutes).toContain('timestamp');
      expect(visibleRoutes).toContain('storageCleaner');
      expect(visibleRoutes).toContain('openUrl');
    });

    it('should not include openUrlViewer (not visible by default)', () => {
      const visibleRoutes = getDefaultVisibleRoutes();
      expect(visibleRoutes).not.toContain('openUrlViewer');
    });
  });

  describe('getAllRouteKeys', () => {
    it('should return all route keys', () => {
      const allKeys = getAllRouteKeys();
      expect(allKeys).toHaveLength(5);
      expect(allKeys).toContain('dashboard');
      expect(allKeys).toContain('timestamp');
      expect(allKeys).toContain('storageCleaner');
      expect(allKeys).toContain('openUrl');
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

    it('should include timestamp, storageCleaner, openUrl in page order', () => {
      const pageOrder = getDefaultPageOrder();
      expect(pageOrder).toContain('timestamp');
      expect(pageOrder).toContain('storageCleaner');
      expect(pageOrder).toContain('openUrl');
    });

    it('should have 3 items in page order', () => {
      const pageOrder = getDefaultPageOrder();
      expect(pageOrder).toHaveLength(3);
    });
  });
});