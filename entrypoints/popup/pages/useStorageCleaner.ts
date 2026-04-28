import { useState, useEffect, useCallback, useRef } from 'react';
import { storageUtil } from '@/utils/chromeStorage';
import type { SnackbarOptions } from '@/components/GlobalSnackbar';
import type {
  StorageCleanerOptions,
  CleaningResult,
  StorageCleanerPreferences,
} from '@/types/storage';
import {
  getCurrentTab,
  isRestrictedUrl,
  clearStorage,
  getCookieSize,
  getLocalStorageSize,
  getSessionStorageSize,
  getIndexedDBSize,
  getCacheStorageSize,
  getServiceWorkerCount,
} from '@/utils/storageCleaner';

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
  // State
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

  // Computed
  totalSize: number;
  allSelected: boolean;
  someSelected: boolean;

  // Handlers
  handleAutoRefreshChange: (checked: boolean) => Promise<void>;
  handleOptionChange: (key: keyof StorageCleanerOptions) => Promise<void>;
  handleSelectAll: (checked: boolean) => Promise<void>;
  handleClean: () => Promise<void>;
}

export interface UseStorageCleanerOptions {
  showMessage: (message: string, options?: SnackbarOptions) => void;
}

export function useStorageCleaner({
  showMessage,
}: UseStorageCleanerOptions): UseStorageCleanerReturn {
  const [domain, setDomain] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [options, setOptions] = useState<StorageCleanerOptions>(DEFAULT_OPTIONS);
  const [sizes, setSizes] = useState<Record<string, number>>({});
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CleaningResult | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const reloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const requestIdRef = useRef<number>(0);

  useEffect(() => {
    const reloadTimeout = reloadTimeoutRef.current;
    const resultTimeout = resultTimeoutRef.current;
    return () => {
      if (reloadTimeout) clearTimeout(reloadTimeout);
      if (resultTimeout) clearTimeout(resultTimeout);
    };
  }, []);

  const loadInfo = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current;
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
      setDomain(new URL(url).hostname);

      const [savedPrefs, cSize, lsSize, ssSize, idbSize, cacheCount, swCount] = await Promise.all([
        storageUtil.get('storageCleaner/preferences', DEFAULT_PREFERENCES),
        getCookieSize(url),
        getLocalStorageSize(tabId),
        getSessionStorageSize(tabId),
        getIndexedDBSize(tabId),
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
  }, []);

  const loadInfoRef = useRef(loadInfo);
  loadInfoRef.current = loadInfo;

  useEffect(() => {
    loadInfoRef.current();

    const handleTabChange = () => loadInfoRef.current();
    const handleTabUpdated = (_tabId: number, changeInfo: { status?: string; url?: string }) => {
      if (changeInfo.status === 'complete' || changeInfo.url) {
        loadInfoRef.current();
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
  }, []);

  const handleAutoRefreshChange = useCallback(
    async (checked: boolean) => {
      setAutoRefresh(checked);
      await storageUtil.set('storageCleaner/preferences', {
        autoRefresh: checked,
        selectedTypes: options,
      });
    },
    [options],
  );

  const handleOptionChange = useCallback(
    async (key: keyof StorageCleanerOptions) => {
      setOptions((prev) => {
        const newOptions = { ...prev, [key]: !prev[key] };
        storageUtil.set('storageCleaner/preferences', {
          autoRefresh,
          selectedTypes: newOptions,
        });
        return newOptions;
      });
    },
    [autoRefresh],
  );

  const handleSelectAll = useCallback(
    async (checked: boolean) => {
      const newOptions = {
        localStorage: checked,
        sessionStorage: checked,
        indexedDB: checked,
        cookies: checked,
        cacheStorage: checked,
        serviceWorkers: checked,
      };
      setOptions(newOptions);
      await storageUtil.set('storageCleaner/preferences', {
        autoRefresh,
        selectedTypes: newOptions,
      });
    },
    [autoRefresh],
  );

  const handleClean = useCallback(async () => {
    const tab = await getCurrentTab();
    if (!tab || !tab.id || !tab.url) {
      showMessage('无法获取当前标签页', { severity: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const cleaningResult = await clearStorage(tab.id, tab.url, options);
      setResult(cleaningResult);

      if (autoRefresh && cleaningResult.success) {
        showMessage('清理成功，即将刷新页面', { severity: 'success' });
        await chrome.runtime.sendMessage({ action: 'reloadTab', tabId: tab.id, delay: 1000 });
      } else {
        await loadInfo();
      }
    } catch (err) {
      showMessage(`清理失败: ${String(err)}`, { severity: 'error' });
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  }, [options, autoRefresh, showMessage, loadInfo]);

  // Computed values
  // Note: sizes.indexedDB contains navigator.storage.estimate().usage
  // which includes IndexedDB, Cache, etc.
  const totalSize = (sizes.cookies || 0) + (sizes.indexedDB || 0);

  const allSelected = Object.values(options).every(Boolean);
  const someSelected = Object.values(options).some(Boolean) && !allSelected;

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
    allSelected,
    someSelected,
    handleAutoRefreshChange,
    handleOptionChange,
    handleSelectAll,
    handleClean,
  };
}
