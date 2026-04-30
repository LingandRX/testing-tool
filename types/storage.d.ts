export type PageType =
  | 'dashboard'
  | 'timestamp'
  | 'storageCleaner'
  | 'openUrl'
  | 'qrCode'
  | 'formRecognizer'
  | 'formMapping'
  | 'formFill'
  | 'openUrlViewer';

export interface FormMapEntry {
  id: string;
  label_display: string;
  fingerprint: {
    selector: string;
    name_attr: string;
    placeholder: string;
  };
  action_logic: {
    type: 'text' | 'select' | 'checkbox';
    strategy: 'fixed' | 'random' | 'sequence';
    value: string;
  };
  ui_state: {
    is_selected: boolean;
  };
}

export interface StorageSchema {
  'app/currentRoute': PageType;
  'app/popupRoute': PageType;
  'app/sidepanelRoute': PageType;
  'app/visiblePages': PageType[];
  'app/pageOrder': PageType[];
  'app/lastRoute': string;
  'app/theme': string;
  'app/formMapping/isPicking': boolean;
  active_form_map: FormMapEntry[];
  'storageCleaner/preferences': StorageCleanerPreferences;
  'openUrl/preferences': OpenUrlPreferences;
  'openUrl/currentUrl': string;
  'qrCode/qrExpanded': boolean;
  'qrCode/urlExpanded': boolean;
  'formRecognizer/fieldTypePreferences': FieldTypePreferences;
}

export interface FieldTypePreferences {
  [domain: string]: {
    [fieldIdentifier: string]: string;
  };
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
