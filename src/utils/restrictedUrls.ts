/** 浏览器内部/受限协议（含尾部冒号，用于 protocol 匹配） */
export const RESTRICTED_PROTOCOLS = [
  'chrome:',
  'chrome-extension:',
  'about:',
  'edge:',
  'brave:',
  'view-source:',
  'file:',
  'data:',
] as const;

export function getUrlProtocol(url: string): string | null {
  try {
    return new URL(url).protocol;
  } catch {
    return null;
  }
}

/** 用于 content script / 右键恢复等（protocol 精确匹配） */
export function isUnsupportedPageUrl(url: string | undefined): boolean {
  if (!url) return true;
  const protocol = getUrlProtocol(url);
  if (!protocol) return true;
  return RESTRICTED_PROTOCOLS.some((p) => p === protocol);
}

/** 用于 storage cleaner tab 检测（前缀匹配，兼容无 protocol 的场景） */
export function isRestrictedUrl(url?: string): boolean {
  if (!url) return true;
  return RESTRICTED_PROTOCOLS.some((p) => url.startsWith(p));
}
