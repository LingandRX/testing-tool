import type { ComponentType } from 'react';

export default function loadQrCode(): Promise<{ default: ComponentType }> {
  return import('@/pages/QrCode');
}
