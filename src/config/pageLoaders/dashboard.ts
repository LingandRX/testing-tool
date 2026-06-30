import type { ComponentType } from 'react';

export default function loadDashboard(): Promise<{ default: ComponentType }> {
  return import('@/pages/Dashboard');
}
