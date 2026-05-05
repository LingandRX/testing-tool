import { useCallback, useEffect, useRef, useState } from 'react';
import { storageUtil } from '@/utils/chromeStorage';
import type { SnackbarOptions } from '@/components/GlobalSnackbar';
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
  getIndexedDBSize,
  getLocalStorageSize,
  getServiceWorkerCount,
  getSessionStorageSize,
  isRestrictedUrl,
} from '@/utils/storageCleaner';
import { MessageAction, sendMessage } from '@/utils/messages';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation(['storageCleaner', 'common']);
  const [domain, setDomain] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [options, setOptions] = useState<StorageCleanerOptions>(DEFAULT_OPTIONS);
  const [sizes, setSizes] = useState<Record<string, number>>({});
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CleaningResult | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const requestIdRef = useRef<number>(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const resultTimeout = resultTimeoutRef.current;
    return () => {
      if (resultTimeout) clearTimeout(resultTimeout);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

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
  }, [t]);

  const loadInfoRef = useRef(loadInfo);
  loadInfoRef.current = loadInfo;

  const debouncedLoadInfo = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      loadInfoRef.current().catch(console.error);
    }, 300);
  }, []);

  useEffect(() => {
    // 首次加载不防抖
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
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [debouncedLoadInfo]);

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
    if (loading) {
      return;
    }
    const tab = await getCurrentTab();
    if (!tab || !tab.id || !tab.url) {
      showMessage(t('storageCleaner:errorNoTab'), { severity: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const cleaningResult = await clearStorage(tab.id, tab.url, options);
      setResult(cleaningResult);

      if (autoRefresh && cleaningResult.success) {
        showMessage(t('storageCleaner:cleanSuccessReload'), { severity: 'success' });
        await sendMessage(MessageAction.RELOAD_TAB, { tabId: tab.id, delay: 1000 });
      } else {
        await loadInfo();
      }
    } catch (err) {
      showMessage(`${t('common:messages.copyError')}: ${String(err)}`, { severity: 'error' });
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  }, [loading, options, autoRefresh, showMessage, loadInfo, t]);

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
