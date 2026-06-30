import type { ComponentType } from 'react';

export default function loadBase64Converter(): Promise<{ default: ComponentType }> {
  return import('@/pages/Base64Converter');
}
