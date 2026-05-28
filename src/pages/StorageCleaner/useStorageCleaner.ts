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
import { useI18n } from '@/utils/chromeI18n';
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
  reloadAfterClean: true,
  selectedTypes: DEFAULT_OPTIONS,
};

export interface UseStorageCleanerReturn {
  domain: string;
  error: string;
  isInitializing: boolean;
  options: StorageCleanerOptions;
  sizes: Record<string, number>;
  reloadAfterClean: boolean;
  loading: boolean;
  result: CleaningResult | null;
  showConfirm: boolean;
  setShowConfirm: (show: boolean) => void;
  totalSize: number;
  allSelected: boolean;
  someSelected: boolean;

  handleReloadAfterCleanChange: (checked: boolean) => void;
  handleOptionChange: (key: keyof StorageCleanerOptions) => void;
  handleSelectAll: (checked: boolean) => void;
  handleClean: () => Promise<void>;
}

export function useStorageCleaner(): UseStorageCleanerReturn {
  const { t } = useI18n(['storageCleaner', 'common']);
  const [domain, setDomain] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [options, setOptions] = useState<StorageCleanerOptions>(DEFAULT_OPTIONS);
  const [sizes, setSizes] = useState<Record<string, number>>({});
  const [reloadAfterClean, setReloadAfterClean] = useState<boolean>(true);
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
        setReloadAfterClean(savedPrefs.reloadAfterClean ?? DEFAULT_PREFERENCES.reloadAfterClean);
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

  useEffect(() => {
    if (isInitializing) return;

    if (storageTimerRef.current) clearTimeout(storageTimerRef.current);
    storageTimerRef.current = setTimeout(async () => {
      await storageUtil
        .set('storageCleaner/preferences', {
          reloadAfterClean,
          selectedTypes: options,
        })
        .catch(console.error);
    }, 500);
  }, [options, reloadAfterClean, isInitializing]);

  const handleReloadAfterCleanChange = useCallback((checked: boolean) => {
    setReloadAfterClean(checked);
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

      if (reloadAfterClean && cleaningResult.success) {
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
  }, [options, reloadAfterClean, loadInfo, t]);

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
    reloadAfterClean,
    loading,
    result,
    showConfirm,
    setShowConfirm,
    totalSize,
    allSelected: selectionMetrics.all,
    someSelected: selectionMetrics.some,
    handleReloadAfterCleanChange,
    handleOptionChange,
    handleSelectAll,
    handleClean,
  };
}
