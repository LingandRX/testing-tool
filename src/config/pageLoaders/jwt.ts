import type { ComponentType } from 'react';

export default function loadJwt(): Promise<{ default: ComponentType }> {
  return import('@/pages/Jwt');
}
