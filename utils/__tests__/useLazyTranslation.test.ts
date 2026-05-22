import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// 强行砸碎当前模块的 Mock 封锁链，拉取真实的源码进行满血硬核测试
vi.unmock('@/utils/useLazyTranslation');

// 满血配置多端一致性常驻桩（WXT 规范）
const storageOnChangedMock = { addListener: vi.fn(), removeListener: vi.fn() };
(globalThis as any).chrome = { storage: { onChanged: storageOnChangedMock } };
(globalThis as any).browser = { storage: { onChanged: storageOnChangedMock } };

// Mock 基础 i18n 底座
vi.mock('@/i18n', () => ({
  default: {
    language: 'en',
    addResourceBundle: vi.fn(),
  },
}));

// Mock 核心 react-i18next 管道
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn((ns: string | string[]) => {
    const nsArray = Array.isArray(ns) ? ns : [ns];
    return {
      t: (key: string) => `${nsArray.join(',')}:${key}`,
      i18n: { language: 'en' },
      ready: true,
    };
  }),
}));

// Mock 动态本地化语言包 JSON 实体隔离区
const mockTimestampModule = { default: { 'timestamp.key': 'Timestamp Value' } };
const mockJwtModule = { default: { 'jwt.key': 'JWT Value' } };
const mockZhTimestampModule = { default: { 'timestamp.key': '时间戳值' } };

vi.mock('@/i18n/locales/en/timestamp.json', () => mockTimestampModule);
vi.mock('@/i18n/locales/en/jwt.json', () => mockJwtModule);
vi.mock('@/i18n/locales/zh/timestamp.json', () => mockZhTimestampModule);

// 💡 1. 核心修复点：将 i18nMock 提升至【全域最高生存空间】！
// 确保下方所有的 describe 块和测试用例在词法作用域上均能 100% 自由消费。
let i18nMock: { language: string; addResourceBundle: ReturnType<typeof vi.fn> };

/**
 * 💡 2. 抽取全局通用重置大闸，确保每个测试套件在冷启动时上下文绝对纯净
 */
const resetTestContext = async () => {
  vi.clearAllMocks();

  // 动态捕获最新 i18n 实例状态
  const i18nModule = await import('@/i18n');
  i18nMock = i18nModule.default as any;
  i18nMock.language = 'en'; // 强行重置为默认英文环境

  // 安全清空生产文件里的内部私有缓存，杜绝跨用例状态株连
  const lazyModule = await import('@/utils/useLazyTranslation');
  if (
    '__test_clearCache' in lazyModule &&
    typeof (lazyModule as any).__test_clearCache === 'function'
  ) {
    (lazyModule as any).__test_clearCache();
  }
};

describe('preloadNamespaces', () => {
  beforeEach(async () => {
    await resetTestContext();
  });

  it('应该加载指定的命名空间', async () => {
    const { preloadNamespaces } = await import('@/utils/useLazyTranslation');
    await preloadNamespaces(['timestamp']);

    expect(i18nMock.addResourceBundle).toHaveBeenCalledWith(
      'en',
      'timestamp',
      mockTimestampModule.default,
      true,
      true,
    );
  });

  it('应该并行加载多个命名空间', async () => {
    const { preloadNamespaces } = await import('@/utils/useLazyTranslation');
    await preloadNamespaces(['timestamp', 'jwt']);

    expect(i18nMock.addResourceBundle).toHaveBeenCalledTimes(2);
    expect(i18nMock.addResourceBundle).toHaveBeenCalledWith(
      'en',
      'timestamp',
      mockTimestampModule.default,
      true,
      true,
    );
  });

  it('应该缓存已加载的命名空间，避免重复加载', async () => {
    const { preloadNamespaces } = await import('@/utils/useLazyTranslation');
    await preloadNamespaces(['timestamp']);
    await preloadNamespaces(['timestamp']);

    expect(i18nMock.addResourceBundle).toHaveBeenCalledTimes(1);
  });

  it('应该使用当前语言（中文）', async () => {
    const { preloadNamespaces } = await import('@/utils/useLazyTranslation');
    i18nMock.language = 'zh-CN';

    await preloadNamespaces(['timestamp']);

    expect(i18nMock.addResourceBundle).toHaveBeenCalledWith(
      'zh',
      'timestamp',
      mockZhTimestampModule.default,
      true,
      true,
    );
  });

  it('应该跳过不存在的命名空间', async () => {
    const { preloadNamespaces } = await import('@/utils/useLazyTranslation');
    await preloadNamespaces(['nonExistentNamespace']);

    expect(i18nMock.addResourceBundle).not.toHaveBeenCalled();
  });
});

describe('useLazyTranslation', () => {
  beforeEach(async () => {
    // 💡 3. 修复点：共享全局重置中枢，让第二个测试块在冷启动时也能合法刷新并拥有 i18nMock 实体
    await resetTestContext();
  });

  it('应该在挂载时加载命名空间', async () => {
    const { useLazyTranslation } = await import('@/utils/useLazyTranslation');

    const { result } = renderHook(() => useLazyTranslation('timestamp'));

    expect(result.current.isLoaded).toBe(false);

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    // 💡 此时 i18nMock 在全域可读，彻底治愈 ReferenceError 报错！
    expect(i18nMock.addResourceBundle).toHaveBeenCalledWith(
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

    const { result } = renderHook(() => useLazyTranslation(['timestamp', 'jwt']));

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    expect(i18nMock.addResourceBundle).toHaveBeenCalledTimes(2);
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
