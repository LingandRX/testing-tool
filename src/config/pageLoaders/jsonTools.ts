import type { ComponentType } from 'react';

export default function loadJsonTools(): Promise<{ default: ComponentType }> {
  return import('@/pages/JsonTools');
}
