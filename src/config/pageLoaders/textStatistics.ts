import type { ComponentType } from 'react';

export default function loadTextStatistics(): Promise<{ default: ComponentType }> {
  return import('@/pages/TextStatistics');
}
