import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';
import { storageUtil } from '@/utils/chromeStorage';
import {
  getDefaultVisibleFeatureKeys,
  getDefaultPageOrder,
  getFeatureByKey,
} from '@/config/features';

// Mock storageUtil
vi.mock('@/utils/chromeStorage', () => ({
  storageUtil: {
    get: vi.fn(),
    set: vi.fn(() => Promise.resolve()),
  },
}));

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('Options App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('合法数据应正常加载并显示正确的功能列表', async () => {
    const defaultOrder = getDefaultPageOrder();

    (storageUtil.get as any).mockImplementation((_key: string, defaultValue: any) =>
      Promise.resolve(defaultValue),
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // 验证默认可见的功能都被渲染出来了
    for (const key of defaultOrder) {
      const feature = getFeatureByKey(key);
      if (feature) {
        expect(screen.getByText(feature.labelKey)).toBeInTheDocument();
      }
    }
  });

  it('非法 visiblePages 数据应回退到默认值', async () => {
    const defaultVisible = getDefaultVisibleFeatureKeys();

    (storageUtil.get as any).mockImplementation((key: string, defaultValue: any) => {
      if (key.includes('VisiblePages')) {
        return Promise.resolve(['invalidPage', 'anotherInvalid']);
      }
      return Promise.resolve(defaultValue);
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // 验证默认值的功能仍然被渲染（非法数据被回退）
    for (const key of defaultVisible) {
      const feature = getFeatureByKey(key);
      if (feature && key !== 'dashboard') {
        expect(screen.getByText(feature.labelKey)).toBeInTheDocument();
      }
    }
  });

  it('非法 pageOrder 数据应回退到默认值', async () => {
    const defaultOrder = getDefaultPageOrder();

    (storageUtil.get as any).mockImplementation((key: string, defaultValue: any) => {
      if (key.includes('PageOrder')) {
        return Promise.resolve(['notARealPage', 123, null]);
      }
      return Promise.resolve(defaultValue);
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // 验证默认顺序的功能都被渲染
    for (const key of defaultOrder) {
      const feature = getFeatureByKey(key);
      if (feature) {
        expect(screen.getByText(feature.labelKey)).toBeInTheDocument();
      }
    }
  });

  it('非数组数据应回退到默认值', async () => {
    const defaultOrder = getDefaultPageOrder();

    (storageUtil.get as any).mockImplementation((key: string, defaultValue: any) => {
      if (key.includes('VisiblePages')) {
        return Promise.resolve('not-an-array');
      }
      if (key.includes('PageOrder')) {
        return Promise.resolve({ foo: 'bar' });
      }
      return Promise.resolve(defaultValue);
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // 验证默认功能都被渲染
    for (const key of defaultOrder) {
      const feature = getFeatureByKey(key);
      if (feature) {
        expect(screen.getByText(feature.labelKey)).toBeInTheDocument();
      }
    }
  });
});
