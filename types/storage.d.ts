export type PageType =
  | 'dashboard'
  | 'timestamp'
  | 'storageCleaner'
  | 'openUrl'
  | 'qrCode'
  | 'openUrlViewer';

export interface StorageSchema {
  'app/currentRoute': PageType;
  'app/popupRoute': PageType;
  'app/sidepanelRoute': PageType;
  'app/visiblePages': PageType[];
  'app/pageOrder': PageType[];
  'app/lastRoute': string;
  'app/theme': string;
  'storageCleaner/preferences': StorageCleanerPreferences;
  'openUrl/preferences': OpenUrlPreferences;
  'openUrl/currentUrl': string;
  'qrCode/qrExpanded': boolean;
  'qrCode/urlExpanded': boolean;
}

export interface StorageCleanerPreferences {
  autoRefresh: boolean;
  selectedTypes: StorageCleanerOptions;
}

export interface OpenUrlEntry {
  name: string;
  url: string;
}

export interface OpenUrlPreferences {
  entries: OpenUrlEntry[];
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
