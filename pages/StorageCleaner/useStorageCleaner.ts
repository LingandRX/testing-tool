import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { storageUtil } from '@/utils/chromeStorage';
import type {
  CleaningResult,
  StorageCleanerOptions,
  StorageCleanerPreferences,
} from '@/types/storage';
import {
  clearStorage,
  getCacheStorageSize,
  getCookieSize,
  getCurrentTab,
  getLocalStorageSize,
  getOriginStorageEstimate,
  getServiceWorkerCount,
  getSessionStorageSize,
  isRestrictedUrl,
} from '@/utils/storageCleaner';
import { MessageAction, sendMessage } from '@/utils/messages';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import { toast } from 'sonner'; // 1. 直接引用 shadcn 推荐的 Sonner 单例通知，踢出回调依赖

const DEFAULT_OPTIONS: StorageCleanerOptions = {
  localStorage: true,
  sessionStorage: true,
  indexedDB: true,
  cookies: true,
  cacheStorage: true,
  serviceWorkers: true,
};

const DEFAULT_PREFERENCES: StorageCleanerPreferences = {
  autoRefresh: true,
  selectedTypes: DEFAULT_OPTIONS,
};

export interface UseStorageCleanerReturn {
  domain: string;
  error: string;
  isInitializing: boolean;
  options: StorageCleanerOptions;
  sizes: Record<string, number>;
  autoRefresh: boolean;
  loading: boolean;
  result: CleaningResult | null;
  showConfirm: boolean;
  setShowConfirm: (show: boolean) => void;
  totalSize: number;
  allSelected: boolean;
  someSelected: boolean;

  handleAutoRefreshChange: (checked: boolean) => void;
  handleOptionChange: (key: keyof StorageCleanerOptions) => void;
  handleSelectAll: (checked: boolean) => void;
  handleClean: () => Promise<void>;
}

export function useStorageCleaner(): UseStorageCleanerReturn {
  const { t } = useLazyTranslation(['storageCleaner', 'common']);
  const [domain, setDomain] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [options, setOptions] = useState<StorageCleanerOptions>(DEFAULT_OPTIONS);
  const [sizes, setSizes] = useState<Record<string, number>>({});
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CleaningResult | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const requestIdRef = useRef<number>(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const storageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const loadingRef = useRef(loading);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (storageTimerRef.current) clearTimeout(storageTimerRef.current);
    };
  }, []);

  // 核心数据拉取链条
  const loadInfo = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current;
    try {
      const tab = await getCurrentTab();
      if (currentRequestId !== requestIdRef.current) return;

      if (!tab || !tab.url) {
        setError(t('storageCleaner:errorNoTab'));
        return;
      }
      if (isRestrictedUrl(tab.url)) {
        setError(t('storageCleaner:errorRestricted'));
        return;
      }

      setError('');
      const url = tab.url;
      const tabId = tab.id!;
      setDomain(new URL(url).hostname);

      const [savedPrefs, cSize, lsSize, ssSize, idbSize, cacheCount, swCount] = await Promise.all([
        storageUtil.get('storageCleaner/preferences', DEFAULT_PREFERENCES),
        getCookieSize(url),
        getLocalStorageSize(tabId),
        getSessionStorageSize(tabId),
        getOriginStorageEstimate(tabId),
        getCacheStorageSize(tabId),
        getServiceWorkerCount(tabId),
      ]);

      if (currentRequestId !== requestIdRef.current) return;

      if (savedPrefs) {
        setAutoRefresh(savedPrefs.autoRefresh ?? DEFAULT_PREFERENCES.autoRefresh);
        setOptions(savedPrefs.selectedTypes ?? DEFAULT_PREFERENCES.selectedTypes);
      }

      setSizes({
        cookies: cSize,
        localStorage: lsSize,
        sessionStorage: ssSize,
        indexedDB: idbSize,
        cacheStorage: cacheCount,
        serviceWorkers: swCount,
      });
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsInitializing(false);
      }
    }
  }, [t]);

  const loadInfoRef = useRef(loadInfo);
  useEffect(() => {
    loadInfoRef.current = loadInfo;
  });

  const debouncedLoadInfo = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      loadInfoRef.current().catch(console.error);
    }, 300);
  }, []);

  // 监听浏览器标签行为
  useEffect(() => {
    loadInfoRef.current().catch(console.error);

    const handleTabChange = () => debouncedLoadInfo();
    const handleTabUpdated = (_tabId: number, changeInfo: { status?: string; url?: string }) => {
      if (changeInfo.status === 'complete' || changeInfo.url) {
        debouncedLoadInfo();
      }
    };

    chrome.tabs.onActivated.addListener(handleTabChange);
    chrome.tabs.onUpdated.addListener(handleTabUpdated);
    chrome.windows.onFocusChanged.addListener(handleTabChange);

    return () => {
      chrome.tabs.onActivated.removeListener(handleTabChange);
      chrome.tabs.onUpdated.removeListener(handleTabUpdated);
      chrome.windows.onFocusChanged.removeListener(handleTabChange);
    };
  }, [debouncedLoadInfo]);

  // 2. 超进化：防抖写盘管道 (Chrome Storage Debounce Pipeline)
  // 用户疯狂点击勾选时，React 状态保持丝滑的 0 延迟同步，只有停下点击 500ms 后，才会真正发起一次 Chrome 存盘，配额永远安全。
  useEffect(() => {
    // 过滤掉首次初始化时的无意义写盘
    if (isInitializing) return;

    if (storageTimerRef.current) clearTimeout(storageTimerRef.current);
    storageTimerRef.current = setTimeout(async () => {
      await storageUtil
        .set('storageCleaner/preferences', {
          autoRefresh,
          selectedTypes: options,
        })
        .catch(console.error);
    }, 500);
  }, [options, autoRefresh, isInitializing]);

  // 3. 极速状态分发：同步函数化（去掉了原有的 async 声明，只负责触发状态）
  const handleAutoRefreshChange = useCallback((checked: boolean) => {
    setAutoRefresh(checked);
  }, []);

  const handleOptionChange = useCallback((key: keyof StorageCleanerOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    setOptions({
      localStorage: checked,
      sessionStorage: checked,
      indexedDB: checked,
      cookies: checked,
      cacheStorage: checked,
      serviceWorkers: checked,
    });
  }, []);

  // 清理动作核心
  const handleClean = useCallback(async () => {
    if (loadingRef.current) return;

    const tab = await getCurrentTab();
    if (!tab || !tab.id || !tab.url) {
      toast.warning(t('storageCleaner:errorNoTab'));
      return;
    }

    setLoading(true);
    try {
      const cleaningResult = await clearStorage(tab.id, tab.url, options);
      setResult(cleaningResult);

      if (autoRefresh && cleaningResult.success) {
        toast.success(t('storageCleaner:cleanSuccessReload'));
        await sendMessage(MessageAction.RELOAD_TAB, { tabId: tab.id, delay: 1000 });
      } else {
        await loadInfo();
      }
    } catch (err) {
      toast.error(`${t('storageCleaner:cleanError')}: ${String(err)}`);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  }, [options, autoRefresh, loadInfo, t]);

  // 4. 精准的流式衍生计算收拢：完全切断垃圾内存常态分配
  const totalSize = useMemo(() => {
    return (
      (sizes.cookies || 0) +
      (sizes.localStorage || 0) +
      (sizes.sessionStorage || 0) +
      (sizes.indexedDB || 0)
    );
  }, [sizes]);

  const selectionMetrics = useMemo(() => {
    const vals = Object.values(options);
    const all = vals.every(Boolean);
    const some = vals.some(Boolean) && !all;
    return { all, some };
  }, [options]);

  return {
    domain,
    error,
    isInitializing,
    options,
    sizes,
    autoRefresh,
    loading,
    result,
    showConfirm,
    setShowConfirm,
    totalSize,
    allSelected: selectionMetrics.all,
    someSelected: selectionMetrics.some,
    handleAutoRefreshChange,
    handleOptionChange,
    handleSelectAll,
    handleClean,
  };
}
