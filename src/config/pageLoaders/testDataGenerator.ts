import type { ComponentType } from 'react';

export default function loadTestDataGenerator(): Promise<{ default: ComponentType }> {
  return import('@/pages/TestDataGenerator');
}
