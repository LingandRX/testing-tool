import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { preloadNamespaces } from '@/utils/useLazyTranslation';

// Mock i18n
vi.mock('@/i18n', () => ({
  default: {
    language: 'en',
    addResourceBundle: vi.fn(),
  },
}));

// Mock useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn((ns: string[]) => ({
    t: (key: string) => `${ns.join(',')}:${key}`,
    i18n: { language: 'en' },
    ready: true,
  })),
}));

// Mock 动态导入
const mockTimestampModule = { default: { 'timestamp.key': 'Timestamp Value' } };
const mockJwtModule = { default: { 'jwt.key': 'JWT Value' } };

vi.mock('@/i18n/locales/en/timestamp.json', () => mockTimestampModule);
vi.mock('@/i18n/locales/en/jwt.json', () => mockJwtModule);
vi.mock('@/i18n/locales/zh/timestamp.json', () => ({ default: { 'timestamp.key': '时间戳值' } }));

describe('preloadNamespaces', () => {
  let i18n: { addResourceBundle: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    vi.clearAllMocks();
    i18n = (await import('@/i18n')).default as any;
    // 清除缓存
    const { __test_clearCache } = await import('@/utils/useLazyTranslation');
    __test_clearCache?.();
  });

  it('应该加载指定的命名空间', async () => {
    await preloadNamespaces(['timestamp']);

    expect(i18n.addResourceBundle).toHaveBeenCalledWith(
      'en',
      'timestamp',
      mockTimestampModule.default,
      true,
      true,
    );
  });

  it('应该并行加载多个命名空间', async () => {
    await preloadNamespaces(['timestamp', 'jwt']);

    expect(i18n.addResourceBundle).toHaveBeenCalledTimes(2);
    expect(i18n.addResourceBundle).toHaveBeenCalledWith(
      'en',
      'timestamp',
      mockTimestampModule.default,
      true,
      true,
    );
    expect(i18n.addResourceBundle).toHaveBeenCalledWith(
      'en',
      'jwt',
      mockJwtModule.default,
      true,
      true,
    );
  });

  it('应该缓存已加载的命名空间，避免重复加载', async () => {
    await preloadNamespaces(['timestamp']);
    await preloadNamespaces(['timestamp']);

    // 只应调用一次
    expect(i18n.addResourceBundle).toHaveBeenCalledTimes(1);
  });

  it('应该使用当前语言（中文）', async () => {
    const i18nModule = await import('@/i18n');
    (i18nModule.default as any).language = 'zh-CN';

    await preloadNamespaces(['timestamp']);

    expect(i18n.addResourceBundle).toHaveBeenCalledWith(
      'zh',
      'timestamp',
      { 'timestamp.key': '时间戳值' },
      true,
      true,
    );

    // 恢复
    (i18nModule.default as any).language = 'en';
  });

  it('应该跳过不存在的命名空间', async () => {
    await preloadNamespaces(['nonExistentNamespace']);

    // 不应调用 addResourceBundle
    expect(i18n.addResourceBundle).not.toHaveBeenCalled();
  });
});

describe('useLazyTranslation', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // 清除缓存
    const { __test_clearCache } = await import('@/utils/useLazyTranslation');
    __test_clearCache?.();
  });

  it('应该在挂载时加载命名空间', async () => {
    const { useLazyTranslation } = await import('@/utils/useLazyTranslation');
    const i18n = (await import('@/i18n')).default as any;

    const { result } = renderHook(() => useLazyTranslation('timestamp'));

    // 初始状态应该是未加载
    expect(result.current.isLoaded).toBe(false);

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    expect(i18n.addResourceBundle).toHaveBeenCalledWith(
      'en',
      'timestamp',
      mockTimestampModule.default,
      true,
      true,
    );
  });

  it('应该返回 useTranslation 的结果', async () => {
    const { useLazyTranslation } = await import('@/utils/useLazyTranslation');

    const { result } = renderHook(() => useLazyTranslation('timestamp'));

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    expect(result.current.t('key')).toBe('timestamp:key');
    expect(result.current.ready).toBe(true);
  });

  it('应该支持多个命名空间', async () => {
    const { useLazyTranslation } = await import('@/utils/useLazyTranslation');
    const i18n = (await import('@/i18n')).default as any;

    const { result } = renderHook(() => useLazyTranslation(['timestamp', 'jwt']));

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    expect(i18n.addResourceBundle).toHaveBeenCalledTimes(2);
    expect(result.current.t('key')).toBe('timestamp,jwt:key');
  });

  it('应该支持字符串形式的单个命名空间', async () => {
    const { useLazyTranslation } = await import('@/utils/useLazyTranslation');

    const { result } = renderHook(() => useLazyTranslation('timestamp'));

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    expect(result.current.t('key')).toBe('timestamp:key');
  });
});
