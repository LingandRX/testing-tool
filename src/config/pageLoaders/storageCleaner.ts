import type { ComponentType } from 'react';

export default function loadStorageCleaner(): Promise<{ default: ComponentType }> {
  return import('@/pages/StorageCleaner');
}
