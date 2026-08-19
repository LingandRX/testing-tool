import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { browser } from 'wxt/browser';
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
} from '@/utils/storageCleaner';
import { isRestrictedUrl } from '@/utils/restrictedUrls';
import { toast } from 'sonner';

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
  skipConfirm: false,
  selectedTypes: DEFAULT_OPTIONS,
};

const RELOAD_COMPLETE_TIMEOUT_MS = 10_000;

async function reloadTabAndWaitForComplete(tabId: number): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    function cleanup() {
      clearTimeout(timeoutId);
      browser.tabs.onUpdated.removeListener(handleUpdated);
    }

    function finish() {
      cleanup();
      resolve();
    }

    function handleUpdated(updatedTabId: number, changeInfo: { status?: string }) {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        finish();
      }
    }

    const timeoutId = setTimeout(finish, RELOAD_COMPLETE_TIMEOUT_MS);
    browser.tabs.onUpdated.addListener(handleUpdated);

    browser.tabs.reload(tabId).catch((err) => {
      cleanup();
      reject(err);
    });
  });
}

export interface StorageSizeInfo {
  value: number;
  displayType: 'bytes' | 'count';
}

export interface UseStorageCleanerReturn {
  error: string;
  isInitializing: boolean;
  options: StorageCleanerOptions;
  sizes: Record<string, StorageSizeInfo>;
  reloadAfterClean: boolean;
  skipConfirm: boolean;
  loading: boolean;
  cleaningKey: keyof StorageCleanerOptions | null;
  isRefreshingSizes: boolean;
  result: CleaningResult | null;
  showConfirm: boolean;
  setShowConfirm: (show: boolean) => void;
  totalBytes: number;
  hasDataCount: number;
  allSelected: boolean;
  someSelected: boolean;

  handleReloadAfterCleanChange: (checked: boolean) => void;
  handleSkipConfirmChange: (checked: boolean) => void;
  handleOptionChange: (key: keyof StorageCleanerOptions) => void;
  handleSelectAll: (checked: boolean) => void;
  handleSelectOnlyWithData: () => void;
  handleClean: () => Promise<void>;
  handleCleanSingle: (key: keyof StorageCleanerOptions) => Promise<void>;
  triggerClean: () => void;
}

export function useStorageCleaner(): UseStorageCleanerReturn {
  const [error, setError] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [options, setOptions] = useState<StorageCleanerOptions>(DEFAULT_OPTIONS);
  const [sizes, setSizes] = useState<Record<string, StorageSizeInfo>>({});
  const [reloadAfterClean, setReloadAfterClean] = useState<boolean>(true);
  const [skipConfirm, setSkipConfirm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [cleaningKey, setCleaningKey] = useState<keyof StorageCleanerOptions | null>(null);
  const [isRefreshingSizes, setIsRefreshingSizes] = useState<boolean>(false);
  const [result, setResult] = useState<CleaningResult | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const requestIdRef = useRef<number>(0);
  const boundTabRef = useRef<{ id: number; url: string } | null>(null);
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

  const loadInfo = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current;
    setIsRefreshingSizes(true);
    try {
      const tab = await getCurrentTab();
      if (currentRequestId !== requestIdRef.current) return;

      if (!tab || !tab.url) {
        setError('无法获取当前标签页');
        return;
      }
      if (isRestrictedUrl(tab.url)) {
        setError('存储清理功能不支持此页面');
        return;
      }

      setError('');
      const url = tab.url;
      const tabId = tab.id!;

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
        setSkipConfirm(savedPrefs.skipConfirm ?? DEFAULT_PREFERENCES.skipConfirm ?? false);
        setOptions(savedPrefs.selectedTypes ?? DEFAULT_PREFERENCES.selectedTypes);
      }

      setSizes({
        cookies: { value: cSize, displayType: 'bytes' },
        localStorage: { value: lsSize, displayType: 'bytes' },
        sessionStorage: { value: ssSize, displayType: 'bytes' },
        indexedDB: { value: idbSize, displayType: 'bytes' },
        cacheStorage: { value: cacheCount, displayType: 'count' },
        serviceWorkers: { value: swCount, displayType: 'count' },
      });
      boundTabRef.current = { id: tabId, url };
    } catch (err) {
      console.error('Failed to load storage cleaner info:', err);
      if (currentRequestId === requestIdRef.current) {
        setError('读取数据失败');
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsInitializing(false);
        setIsRefreshingSizes(false);
      }
    }
  }, []);

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

  useEffect(() => {
    loadInfoRef.current().catch(console.error);

    const handleTabChange = () => debouncedLoadInfo();
    const handleTabUpdated = (_tabId: number, changeInfo: { status?: string; url?: string }) => {
      if (changeInfo.status === 'complete' || changeInfo.url) {
        debouncedLoadInfo();
      }
    };

    browser.tabs.onActivated.addListener(handleTabChange);
    browser.tabs.onUpdated.addListener(handleTabUpdated);
    browser.windows.onFocusChanged.addListener(handleTabChange);

    return () => {
      browser.tabs.onActivated.removeListener(handleTabChange);
      browser.tabs.onUpdated.removeListener(handleTabUpdated);
      browser.windows.onFocusChanged.removeListener(handleTabChange);
    };
  }, [debouncedLoadInfo]);

  useEffect(() => {
    if (isInitializing) return;

    if (storageTimerRef.current) clearTimeout(storageTimerRef.current);
    storageTimerRef.current = setTimeout(async () => {
      await storageUtil
        .set('storageCleaner/preferences', {
          reloadAfterClean,
          skipConfirm,
          selectedTypes: options,
        })
        .catch(console.error);
    }, 500);
  }, [options, reloadAfterClean, skipConfirm, isInitializing]);

  const handleReloadAfterCleanChange = useCallback((checked: boolean) => {
    setReloadAfterClean(checked);
  }, []);

  const handleSkipConfirmChange = useCallback((checked: boolean) => {
    setSkipConfirm(checked);
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

  const handleSelectOnlyWithData = useCallback(() => {
    const newOptions: StorageCleanerOptions = {
      localStorage: Boolean(sizes.localStorage?.value && sizes.localStorage.value > 0),
      sessionStorage: Boolean(sizes.sessionStorage?.value && sizes.sessionStorage.value > 0),
      indexedDB: Boolean(sizes.indexedDB?.value && sizes.indexedDB.value > 0),
      cookies: Boolean(sizes.cookies?.value && sizes.cookies.value > 0),
      cacheStorage: Boolean(sizes.cacheStorage?.value && sizes.cacheStorage.value > 0),
      serviceWorkers: Boolean(sizes.serviceWorkers?.value && sizes.serviceWorkers.value > 0),
    };
    setOptions(newOptions);
  }, [sizes]);

  const executeClean = useCallback(
    async (targetOptions: StorageCleanerOptions, singleKey?: keyof StorageCleanerOptions) => {
      if (loadingRef.current) return;

      const tab = await getCurrentTab();
      if (!tab || !tab.id || !tab.url) {
        toast.warning('无法获取当前标签页');
        return;
      }

      if (isRestrictedUrl(tab.url)) {
        toast.warning('存储清理功能不支持此页面');
        setShowConfirm(false);
        return;
      }

      const boundTab = boundTabRef.current;
      if (!boundTab || boundTab.id !== tab.id || boundTab.url !== tab.url) {
        toast.warning('当前页面已变更，请等待数据刷新后再清理');
        setShowConfirm(false);
        return;
      }

      setLoading(true);
      if (singleKey) {
        setCleaningKey(singleKey);
      }
      setShowConfirm(false);
      try {
        const cleaningResult = await clearStorage(tab.id, tab.url, targetOptions);
        setResult(cleaningResult);

        if (reloadAfterClean && cleaningResult.overallSuccess) {
          toast.success('清理成功，即将刷新页面');
          await reloadTabAndWaitForComplete(tab.id);
          await loadInfo();
        } else {
          await loadInfo();
        }
      } catch (err) {
        toast.error(`清理失败: ${String(err)}`);
      } finally {
        setLoading(false);
        setCleaningKey(null);
      }
    },
    [loadInfo, reloadAfterClean],
  );

  const handleClean = useCallback(async () => {
    await executeClean(options);
  }, [executeClean, options]);

  const handleCleanSingle = useCallback(
    async (key: keyof StorageCleanerOptions) => {
      const singleOptions: StorageCleanerOptions = {
        localStorage: false,
        sessionStorage: false,
        indexedDB: false,
        cookies: false,
        cacheStorage: false,
        serviceWorkers: false,
        [key]: true,
      };
      await executeClean(singleOptions, key);
    },
    [executeClean],
  );

  const triggerClean = useCallback(() => {
    if (skipConfirm) {
      handleClean().catch(console.error);
    } else {
      setShowConfirm(true);
    }
  }, [skipConfirm, handleClean]);

  const totalBytes = useMemo(() => {
    return Object.values(sizes).reduce((acc, s) => {
      return s.displayType === 'bytes' ? acc + (s.value || 0) : acc;
    }, 0);
  }, [sizes]);

  const hasDataCount = useMemo(() => {
    return Object.values(sizes).filter((s) => (s?.value || 0) > 0).length;
  }, [sizes]);

  const selectionMetrics = useMemo(() => {
    const vals = Object.values(options);
    const all = vals.every(Boolean);
    const some = vals.some(Boolean) && !all;
    return { all, some };
  }, [options]);

  return {
    error,
    isInitializing,
    options,
    sizes,
    reloadAfterClean,
    skipConfirm,
    loading,
    cleaningKey,
    isRefreshingSizes,
    result,
    showConfirm,
    setShowConfirm,
    totalBytes,
    hasDataCount,
    allSelected: selectionMetrics.all,
    someSelected: selectionMetrics.some,
    handleReloadAfterCleanChange,
    handleSkipConfirmChange,
    handleOptionChange,
    handleSelectAll,
    handleSelectOnlyWithData,
    handleClean,
    handleCleanSingle,
    triggerClean,
  };
}
