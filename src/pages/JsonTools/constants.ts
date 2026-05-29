import type { JsonToolsPageMode } from '@/types/storage';

export const VALID_PAGE_MODES: readonly JsonToolsPageMode[] = [
  'diff',
  'format',
  'yaml',
  'toml',
  'minify',
];

export const isValidPageMode = (val: unknown): val is JsonToolsPageMode =>
  typeof val === 'string' && (VALID_PAGE_MODES as readonly string[]).includes(val);

export interface ParseState {
  value: unknown;
  error: string | null;
}

export const tryParse = (raw: string, invalidMsg: string): ParseState => {
  const trimmed = raw.trim();
  if (!trimmed) return { value: undefined, error: null };
  try {
    return { value: JSON.parse(trimmed), error: null };
  } catch {
    return { value: undefined, error: invalidMsg };
  }
};
