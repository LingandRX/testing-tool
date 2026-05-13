/**
 * 格式化字节大小为易读字符串
 *
 * @param bytes 字节数
 * @returns 格式化后的字符串，例如 "1.5 KB" 或 "100 B"
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;

  const units = ['KB', 'MB', 'GB', 'TB'];
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  // KB uses 1 decimal, MB/GB/TB use 2 decimals
  const decimals = unitIndex === 0 ? 1 : 2;
  const formatted = size.toFixed(decimals);

  // Strip trailing zeros and possible trailing dot
  const withoutTrailingZeros = parseFloat(formatted).toString();

  return `${withoutTrailingZeros} ${units[unitIndex]}`;
}
