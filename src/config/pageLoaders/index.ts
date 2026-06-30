import type { ComponentType } from 'react';
import type { PageType } from '@/types/storage';

type PageModule = { default: ComponentType };

export function loadPage(key: PageType): Promise<PageModule> {
  switch (key) {
    case 'dashboard':
      return import('@/config/pageLoaders/dashboard').then((m) => m.default());
    case 'timestamp':
      return import('@/config/pageLoaders/timestamp').then((m) => m.default());
    case 'storageCleaner':
      return import('@/config/pageLoaders/storageCleaner').then((m) => m.default());
    case 'qrCode':
      return import('@/config/pageLoaders/qrCode').then((m) => m.default());
    case 'textStatistics':
      return import('@/config/pageLoaders/textStatistics').then((m) => m.default());
    case 'jwt':
      return import('@/config/pageLoaders/jwt').then((m) => m.default());
    case 'jsonTools':
      return import('@/config/pageLoaders/jsonTools').then((m) => m.default());
    case 'base64Converter':
      return import('@/config/pageLoaders/base64Converter').then((m) => m.default());
    case 'rightClickRestorer':
      return import('@/config/pageLoaders/rightClickRestorer').then((m) => m.default());
    case 'testDataGenerator':
      return import('@/config/pageLoaders/testDataGenerator').then((m) => m.default());
    default: {
      const _exhaustive: never = key;
      return Promise.reject(new Error(`Unknown page: ${String(_exhaustive)}`));
    }
  }
}
