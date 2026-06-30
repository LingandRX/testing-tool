import type { ComponentType } from 'react';

export default function loadTimestamp(): Promise<{ default: ComponentType }> {
  return import('@/pages/Timestamp');
}
