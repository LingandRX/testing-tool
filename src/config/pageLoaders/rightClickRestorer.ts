import type { ComponentType } from 'react';

export default function loadRightClickRestorer(): Promise<{ default: ComponentType }> {
  return import('@/pages/RightClickRestorer');
}
