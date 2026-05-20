import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';

// 语言包动态导入映射
const localeModules: Record<
  string,
  Record<string, () => Promise<{ default: Record<string, unknown> }>>
> = {
  zh: {
    timestamp: () => import('@/i18n/locales/zh/timestamp.json'),
    storageCleaner: () => import('@/i18n/locales/zh/storageCleaner.json'),
    qrCode: () => import('@/i18n/locales/zh/qrCode.json'),
    textStatistics: () => import('@/i18n/locales/zh/textStatistics.json'),
    jwt: () => import('@/i18n/locales/zh/jwt.json'),
    jsonDiff: () => import('@/i18n/locales/zh/jsonDiff.json'),
    jsonFormat: () => import('@/i18n/locales/zh/jsonFormat.json'),
    base64Converter: () => import('@/i18n/locales/zh/base64Converter.json'),
    markdownToHtml: () => import('@/i18n/locales/zh/markdownToHtml.json'),
    htmlToMarkdown: () => import('@/i18n/locales/zh/htmlToMarkdown.json'),
  },
  en: {
    timestamp: () => import('@/i18n/locales/en/timestamp.json'),
    storageCleaner: () => import('@/i18n/locales/en/storageCleaner.json'),
    qrCode: () => import('@/i18n/locales/en/qrCode.json'),
    textStatistics: () => import('@/i18n/locales/en/textStatistics.json'),
    jwt: () => import('@/i18n/locales/en/jwt.json'),
    jsonDiff: () => import('@/i18n/locales/en/jsonDiff.json'),
    jsonFormat: () => import('@/i18n/locales/en/jsonFormat.json'),
    base64Converter: () => import('@/i18n/locales/en/base64Converter.json'),
    markdownToHtml: () => import('@/i18n/locales/en/markdownToHtml.json'),
    htmlToMarkdown: () => import('@/i18n/locales/en/htmlToMarkdown.json'),
  },
};

// 已加载的命名空间缓存
const loadedNamespaces = new Set<string>();

/**
 * 清除已加载命名空间的缓存（仅用于测试）
 * @internal
 */
export function __test_clearCache(): void {
  loadedNamespaces.clear();
}

/**
 * 动态加载 i18n 命名空间
 */
async function loadNamespace(ns: string, lng: string): Promise<void> {
  const cacheKey = `${lng}:${ns}`;

  if (loadedNamespaces.has(cacheKey)) {
    return;
  }

  const langModules = localeModules[lng];
  if (!langModules?.[ns]) {
    return;
  }

  try {
    const module = await langModules[ns]();
    i18n.addResourceBundle(lng, ns, module.default, true, true);
    loadedNamespaces.add(cacheKey);
  } catch (error) {
    console.error(`Failed to load namespace "${ns}" for language "${lng}":`, error);
  }
}

/**
 * 预加载指定命名空间（可在路由切换时调用）
 */
export async function preloadNamespaces(namespaces: string[]): Promise<void> {
  const lng = i18n.language || 'en';
  const normalizedLng = lng.startsWith('zh') ? 'zh' : 'en';

  await Promise.all(namespaces.map((ns) => loadNamespace(ns, normalizedLng)));
}

/**
 * 懒加载翻译 Hook
 *
 * 与 useTranslation 类似，但会在组件挂载时动态加载指定的命名空间
 *
 * @param ns - 命名空间或命名空间数组
 * @returns useTranslation 的返回值
 */
export function useLazyTranslation(ns: string | string[]) {
  const namespaces = useMemo(() => (Array.isArray(ns) ? ns : [ns]), [ns]);
  const [isLoaded, setIsLoaded] = useState(false);
  const translation = useTranslation(namespaces);

  useEffect(() => {
    const loadAll = async () => {
      await preloadNamespaces(namespaces);
      setIsLoaded(true);
    };

    loadAll();
  }, [namespaces]);

  return {
    ...translation,
    isLoaded,
  };
}
