export const SEARCH_HISTORY_LIMIT = 10;
export const SEARCH_HISTORY_DISPLAY = 5;

export const isSearchHistory = (val: unknown): val is string[] =>
  Array.isArray(val) && val.every((item) => typeof item === 'string');
