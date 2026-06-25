import type { StorageCleanerOptions } from '@/types/storage';

export const CLEAN_OPTION_KEYS = [
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'cookies',
  'cacheStorage',
  'serviceWorkers',
] as const satisfies readonly (keyof StorageCleanerOptions)[];

export const OPTION_LABELS: Record<(typeof CLEAN_OPTION_KEYS)[number], string> = {
  localStorage: 'Local Storage',
  sessionStorage: 'Session Storage',
  indexedDB: 'IndexedDB',
  cookies: 'Cookies',
  cacheStorage: 'Cache Storage',
  serviceWorkers: 'Service Workers',
};
