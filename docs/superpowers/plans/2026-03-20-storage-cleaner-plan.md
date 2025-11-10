# Storage Cleaner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a storage cleaner feature to the browser extension popup that allows users to clear localStorage, sessionStorage, IndexedDB, Cookies, Cache Storage, andress Workers for the current page.

**Architecture:** Add new StorageCleanerPage component with tab switching in the popup, using chrome.cookies API for cookies and script injection for other storage types. User preferences are persisted using Chrome Storage.

**Tech Stack:** React 19 + TypeScript, Material UI, Chrome Extension APIs

---

## File Structure

```
entrypoints/popup/
├── App.tsx                           (modify: add tab switching)
└── pages/
    ├── TimestampPage.tsx              (no change)
    └── StorageCleanerPage.tsx            (create: new storage cleaner page)

types/
└── storage.d.ts                        (modify: add storage cleaner types)

utils/
└── storageCleaner.ts                  (create: storage cleaning utilities)

wxt.config.ts                        (modify: add cookies permission)
```

---

## Task 1: Add TypeScript Types for Storage Cleaner

**Files:**

- Modify: `types/storage.d.ts`

- [ ] **Step 1: Add storage cleaner types to StorageSchema and interfaces**

```typescript
export interface StorageSchema {
  'app/lastRoute': string;
  'app/theme': string;
  'storageCleaner/preferences': StorageCleanerPreferences;
}

export interface StorageCleanerPreferences {
  autoRefresh: boolean;
  selectedTypes: StorageCleanerOptions;
}

export interface StorageCleanerOptions {
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
  cookies: boolean;
  cacheStorage: boolean;
  serviceWorkers: boolean;
}

export type StorageCleanResult =
  | {
      success: true;
      count: number;
    }
  | {
      success: false;
      error: string;
    };

export interface CleaningResult {
  success: boolean;
  error?: string;
  localStorage?: StorageCleanResult;
  sessionStorage?: StorageCleanResult;
  indexedDB?: StorageCleanResult;
  cookies?: StorageCleanResult;
  cacheStorage?: StorageCleanResult;
  serviceWorkers?: StorageCleanResult;
}
```

- [ ] **Step 2: Commit TypeScript types**

```bash
git add types/storage.d.ts
git commit -m "feat: add TypeScript types for storage cleaner"
```

---

## Task 2: Add Cookies Permission to Manifest

**Files:**

- Modify: `wxt.config.ts:10-18`

- [ ] **Step 1: Add 'cookies' permission to manifest**

```typescript
permissions: [
  'storage',
  'unlimitedStorage',
  'clipboardWrite',
  'activeTab',
  'scripting',
  'tabs',
  'debugger',
  'cookies', // Add this line
],
```

- [ ] **Step 2: Test build to ensure manifest is valid**

Run: `npm run compile`
Expected: No TypeScript errors

- [ ] **Step 3: Commit manifest changes**

```bash
git add wxt.config.ts
git commit -m "feat: add cookies permission to manifest"
```

---

## Task 3: Create Storage Cleaning Utilities

**Files:**

- Create: `utils/storageCleaner.ts`

- [ ] **Step 1: Create storage cleaning utility file with helper functions**

```typescript
import type { StorageCleanerOptions, CleaningResult, StorageCleanResult } from 'types/storage';

const RESTRICTED_PROTOCOLS = [
  'chrome:',
  'chrome-extension:',
  'about:',
  'edge:',
  'view-source:',
  'file:',
  'data:',
] as const;

export async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

export function isRestrictedUrl(url?: string): boolean {
  if (!url) return true;
  return RESTRICTED_PROTOCOLS.some((p) => url.startsWith(p));
}

export async function clearCookies(url: string): Promise<StorageCleanResult> {
  try {
    const cookies = await chrome.cookies.getAll({ url });
    for (const cookie of cookies) {
      await chrome.cookies.remove({
        url,
        name: cookie.name,
        storeId: cookie.storeId,
      });
    }
    return { success: true, count: cookies.length };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function injectClearLocalStorage(tabId: number): Promise<StorageCleanResult> {
  try {
    const result = await chrome.scripting.executeScript<{ count: number }>({
      target: { tabId },
      func: () => {
        const count = localStorage.length;
        localStorage.clear();
        return { count };
      },
    });
    if (result.result) {
      return { success: true, count: result.result.count };
    }
    return { success: false, error: 'No result returned' };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function injectClearSessionStorage(tabId: number): Promise<StorageCleanResult> {
  try {
    const result = await chrome.scripting.executeScript<{ count: number }>({
      target: { tabId },
      func: () => {
        const count = sessionStorage.length;
        sessionStorage.clear();
        return { count };
      },
    });
    if (result.result) {
      return { success: true, count: result.result.count };
    }
    return { success: false, error: 'No result returned' };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function injectClearIndexedDB(tabId: number): Promise<StorageCleanResult> {
  try {
    const result = await chrome.scripting.executeScript<{ count: number } | { error: string }>({
      target: { tabId },
      func: () => {
        if (typeof indexedDB.databases === 'function') {
          return indexedDB.databases().then(async (databases) => {
            let count = 0;
            for (const db of databases) {
              await new Promise<void>((resolve, reject) => {
                const deleteReq = indexedDB.deleteDatabase(db.name);
                deleteReq.onblocked = () => {
                  console.warn('IndexedDB delete blocked:', db.name);
                };
                deleteReq.onsuccess = () => resolve();
                deleteReq.onerror = () => reject();
              });
              count++;
            }
            return { count };
          });
        }
        return { error: 'databases_api_unavailable' };
      },
    });
    if (result.result) {
      if ('error' in result.result) {
        return { success: false, error: result.result.error };
      }
      return { success: true, count: result.result.count };
    }
    return { success: false, error: 'No result returned' };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function injectClearCacheStorage(tabId: number): Promise<StorageCleanResult> {
  try {
    const result = await chrome.scripting.executeScript<{ count: number }>({
      target: { tabId },
      func: async () => {
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          for (const name of cacheNames) {
            await caches.delete(name);
          }
          return { count: cacheNames.length };
        }
        return { count: 0 };
      },
    });
    if (result.result) {
      return { success: true, count: result.result.count };
    }
    return { success: false, error: 'No result returned' };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function injectUnregisterServiceWorkers(tabId: number): Promise<StorageCleanResult> {
  try {
    const result = await chrome.scripting.executeScript<{ count: number }>({
      target: { tabId },
      func: async () => {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }
          return { count: registrations.length };
        }
        return { count: 0 };
      },
    });
    if (result.result) {
      return { success: true, count: result.result.count };
    }
    return { success: false, error: 'No result returned' };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function clearStorage(
  tabId: number,
  url: string,
  options: StorageCleanerOptions,
): Promise<CleaningResult> {
  const result: CleaningResult = { success: true };

  if (options.localStorage) {
    result.localStorage = await injectClearLocalStorage(tabId);
  }

  if (options.sessionStorage) {
    result.sessionStorage = await injectClearSessionStorage(tabId);
  }

  if (options.indexedDB) {
    result.indexedDB = await injectClearIndexedDB(tabId);
  }

  if (options.cookies) {
    result.cookies = await clearCookies(url);
  }

  if (options.cacheStorage) {
    result.cacheStorage = await injectClearCacheStorage(tabId);
  }

  if (options.serviceWorkers) {
    result.serviceWorkers = await injectUnregisterServiceWorkers(tabId);
  }

  // Check if any operation failed
  const failures = Object.values(result).filter(
    (r): r is StorageCleanResult => r?.success === false,
  );

  if (failures.length > 0) {
    result.success = false;
    result.error = '部分清理失败';
  }

  return result;
}

export function formatCleaningResult(result: CleaningResult): string {
  const parts: string[] = [];

  if (result.localStorage?.success) {
    parts.push(`${result.localStorage.count} 个 localStorage`);
  }
  if (result.sessionStorage?.success) {
    parts.push(`${result.sessionStorage.count} 个 sessionStorage`);
  }
  if (result.indexedDB?.success) {
    parts.push(`${result.indexedDB.count} 个 IndexedDB`);
  }
  if (result.cookies?.success) {
    parts.push(`${result.cookies.count} 个 Cookies`);
  }
  if (result.cacheStorage?.success) {
    parts.push(`${result.cacheStorage.count} 个 Cache`);
  }
  if (result.serviceWorkers?.success) {
    parts.push(`${result.serviceWorkers.count} 个 Service Workers`);
  }

  if (parts.length === 0) {
    return '该页面没有可清理的存储数据';
  }

  return `清理了 ${parts.join(', ')}`;
}

export function isEmptyResult(result: CleaningResult): boolean {
  const values = Object.values(result).filter(
    (r): r is StorageCleanResult => r?.success === true && r.count > 0,
  );
  return values.length === 0;
}
```

- [ ] **Step 2: Commit storage cleaning utilities**

```bash
git add utils/storageCleaner.ts
git commit -m "feat: add storage cleaning utility functions"
```

---

## Task 4: Create StorageCleanerPage Component

**Files:**

- Create: `entrypoints/popup/pages/StorageCleanerPage.tsx`

- [ ] **Step 1: Create StorageCleanerPage component with UI and logic**

```typescript
import { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Checkbox,
  Button,
  FormControlLabel,
  Alert,
  Snackbar,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import { storageUtil } from '@/utils/chromeStorage';
import type { StorageCleanerOptions, CleaningResult, StorageCleanerPreferences } from 'types/storage';
import {
  getCurrentTab,
  isRestrictedUrl,
  clearStorage,
  formatCleaningResult,
  isEmptyResult,
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

export default function StorageCleanerPage() {
  const [domain, setDomain] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [options, setOptions] = useState<StorageCleanerOptions>(DEFAULT_OPTIONS);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CleaningResult | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  // Load tab info and user preferences
  useEffect(() => {
    const loadInfo = async () => {
      const tab = await getCurrentTab();

      if (!tab || !tab.url) {
        setError('无法获取当前标签页');
        return;
      }

      if (isRestrictedUrl(tab.url)) {
        setError('存储清理功能不支持此页面');
        return;
      }

      setDomain(new URL(tab.url).hostname);

      // Load user preferences
      const prefs = await storageUtil.get(
        'storageCleaner/preferences',
        DEFAULT_PREFERENCES,
      );
      setAutoRefresh(prefs.autoRefresh);
      setOptions(prefs.selectedTypes);
    };

    loadInfo();
  }, []);

  const handleOptionChange = useCallback((key: keyof StorageCleanerOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleClean = useCallback(async () => {
    const tab = await getCurrentTab();

    if (!tab || !tab.id || !tab.url) {
      setSnackbar({ open: true, message: '无法获取当前标签页' });
      return;
    }

    setLoading(true);

    try {
      const cleaningResult = await clearStorage(tab.id, tab.url, options);
      setResult(cleaningResult);

      // Save user preferences
      await storageUtil.set('storageCleaner/preferences', {
        autoRefresh,
        selectedTypes: options,
      });

      // Auto refresh if enabled
      if (autoRefresh && cleaningResult.success) {
        setSnackbar({ open: true, message: '页面即将刷新，Popup 将关闭' });
        setTimeout(() => {
          chrome.tabs.reload(tab.id);
        }, 1500);
      }
    } catch (err) {
      setSnackbar({ open: true, message: `清理失败: ${String(err)}` });
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  }, [options, autoRefresh]);

  const handleRefresh = useCallback(async () => {
    const tab = await getCurrentTab();
    if (tab?.id) {
      setSnackbar({ open: true, message: '页面即将刷新，Popup 将关闭' });
      setTimeout(() => {
        chrome.tabs.reload(tab.id);
      }, 1500);
    }
  }, []);

  if (error) {
    return (
      <Paper sx={{ p: 2, m: 1, borderRadius: 2 }}>
        <Alert severity="error" icon={<WarningIcon />}>
          {error}
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, m: 1, borderRadius: 2 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="h5" component="h1" sx={{ mb: 1 }}>
          存储清理
        </Typography>
        <Typography variant="body2" color="text.secondary">
          当前页面: {domain || '加载中...'}
        </Typography>
      </Box>

      {/* Storage Type Options */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          选择要清理的存储类型：
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={options.localStorage}
                onChange={() => handleOptionChange('localStorage')}
              />
            }
            label="localStorage"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={options.sessionStorage}
                onChange={() => handleOptionChange('sessionStorage')}
              />
            }
            label="sessionStorage"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={options.indexedDB}
                onChange={() => handleOptionChange('indexedDB')}
              />
            }
            label="IndexedDB"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={options.cookies}
                onChange={() => handleOptionChange('cookies')}
              />
            }
            label="Cookies"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={options.cacheStorage}
                onChange={() => handleOptionChange('cacheStorage')}
              />
            }
            label="Cache Storage"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={options.serviceWorkers}
                onChange={() => handleOptionChange('serviceWorkers')}
              />
            }
            label="Service Workers"
          />
        </Box>
      </Box>

      {/* Auto Refresh Option */}
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
          }
          label="清理完成后自动刷新页面"
        />
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button
          variant="contained"
          onClick={() => setShowConfirm(true)}
          disabled={loading}
          fullWidth
        >
          {loading ? '清理中...' : '清理'}
        </Button>
      </Box>

      {/* Result Display */}
      {result && (
        <Box sx={{ mb: 2 }}>
          <Alert
            severity={result.success ? 'success' : 'error'}
            sx={{ mb: !autoRefresh && result.success ? 1 : 0 }}
          >
            {result.success ? formatCleaningResult(result) : result.error || '清理失败'}
          </Alert>
          {!autoRefresh && result.success && (
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              fullWidth
            >
              刷新页面
            </Button>
          )}
        </Box>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <Paper
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            zIndex: 10,
          }}
        >
          <Typography variant="h6">确认清理</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 1 }}>
            将清理以下存储类型：
          </Typography>
          <Box sx={{ mb: 1 }}>
            {options.localStorage && (
              <Typography variant="body2">- localStorage</Typography>
            )}
            {options.sessionStorage && (
              <Typography variant="body2">- sessionStorage</Typography>
            )}
            {options.indexedDB && <Typography variant="body2">- IndexedDB</Typography>}
            {options.cookies && <Typography variant="body2">- Cookies</Typography>}
            {options.cacheStorage && (
              <Typography variant="body2">- Cache Storage</Typography>
            )}
            {options.serviceWorkers && (
              <Typography variant="body2">- Service Workers</Typography>
            )}
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', mb: 1 }}
          >
            此操作不可撤销。
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={() => setShowConfirm(false)}>
              取消
            </Button>
            <Button variant="contained" color="error" onClick={handleClean}>
              确认清理
            </Button>
          </Box>
        </Paper>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity="info" variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
```

- [ ] **Step 2: Commit StorageCleanerPage component**

```bash
git add entrypoints/popup/pages/StorageCleanerPage.tsx
git commit -m "feat: add StorageCleanerPage component"
```

---

## Task 5: Update App.tsx with Tab Switching

**Files:**

- Modify: `entrypoints/popup/App.tsx`

- [ ] **Step 1: Add tab switching logic to App.tsx**

```typescript
import { useState } from 'react';
import { Box, Button } from '@mui/material';
import TimestampPage from './pages/TimestampPage';
import StorageCleanerPage from './pages/StorageCleanerPage';
import './App.css';

type PageType = 'timestamp' | 'storageCleaner';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('timestamp');

  return (
    <div className="app">
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button
          variant={currentPage === 'timestamp' ? 'contained' : 'outlined'}
          onClick={() => setCurrentPage('timestamp')}
        >
          时间戳
        </Button>
        <Button
          variant={currentPage === 'storageCleaner' ? 'contained' : 'outlined'}
          onClick={() => setCurrentPage('storageCleaner')}
          sx={{ ml: 1 }}
        >
          存储清理
        </Button>
      </Box>
      {currentPage === 'timestamp' && <TimestampPage />}
      {currentPage === 'storageCleaner' && <StorageCleanerPage />}
    </div>
  );
}

export default App;
```

- [ ] **Step 2: Run type check**

Run: `npm run compile`
Expected: No TypeScript errors

- [ ] **Step 3: Commit App.tsx changes**

```bash
git add entrypoints/popup/App.tsx
git commit -m "feat: add tab switching to App component"
```

---

## Task 6: Build and Test

**Files:**

- No file changes

- [ ] **Step 1: Build the extension**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Run lint check**

Run: `npm run lint`
Expected: No linting errors

- [ ] **Step 3: Load extension in Chrome for manual testing**

Instructions:

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable Developer Mode
3. Click "Load unpacked"
4. Select `.output/chrome-mv3` directory
5. Test on a regular web page (e.g., example.com)

- [ ] **Step 4: Commit successful implementation**

```bash
git commit --allow-empty -m "feat: complete storage cleaner feature implementation"
```

---

## Testing Checklist

After implementation, verify:

- [ ] Tab switching works between timestamp and storage cleaner
- [ ] Current domain displays correctly
- [ ] All storage type checkboxes toggle correctly
- [ ] Auto refresh checkbox persists across sessions
- [ ] Clear confirmation dialog appears
- [ ] Confirmation dialog shows selected storage types
- [ ] localStorage clears successfully
- [ ] sessionStorage clears successfully
- [ ] IndexedDB clears successfully (or shows error if unavailable)
- [ ] Cookies clear successfully
- [ ] Clear httponly and secure cookies
- [ ] Cache Storage clears successfully
- [ ] Service Workers unregister successfully
- [ ] Result message displays correctly
- [ ] Empty state shows friendly message
- [ ] Auto refresh works
- [ ] Manual refresh button appears when auto-refresh is off
- [ ] Restricted pages show error message
- [ ] Snackbar notifications appear correctly
- [ ] Test on localhost

---

## Rollback Plan

If issues occur during testing:

1. Revert to before implementation:

   ```bash
   git reset --hard <commit-before-start>
   ```

2. Or revert specific files:
   ```bash
   git checkout HEAD -- types/storage.d.ts wxt.config.ts utils/storageCleaner.ts entrypoints/popup/App.tsx entrypoints/popup/pages/StorageCleanerPage.tsx
   ```

---

## Notes

- The popup closes automatically when the page is refreshed - this is expected behavior
- IndexedDB.databases() may not be available in all browser versions; the fallback handles this
- Chrome Cookies API requires explicit permission, which is added to the manifest
- User preferences are persisted using the existing chromeStorage.ts utility
