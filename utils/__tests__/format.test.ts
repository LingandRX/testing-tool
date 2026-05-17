import { describe, expect, it } from 'vitest';
import { formatBytes } from '@/utils/format';

describe('formatBytes', () => {
  it('should format 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('should format bytes less than 1024', () => {
    expect(formatBytes(1)).toBe('1 B');
    expect(formatBytes(100)).toBe('100 B');
    expect(formatBytes(500)).toBe('500 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1023)).toBe('1023 B');
  });

  it('should format kilobytes', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(1025)).toBe('1.0 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(2048)).toBe('2.0 KB');
  });

  it('should format megabytes', () => {
    expect(formatBytes(1048576)).toBe('1.00 MB');
    expect(formatBytes(1572864)).toBe('1.50 MB');
    expect(formatBytes(5242880)).toBe('5.00 MB');
  });

  it('should format gigabytes', () => {
    expect(formatBytes(1073741824)).toBe('1.00 GB');
    expect(formatBytes(2147483648)).toBe('2.00 GB');
  });

  it('should format terabytes', () => {
    expect(formatBytes(1099511627776)).toBe('1.00 TB');
    expect(formatBytes(2199023255552)).toBe('2.00 TB');
  });

  it('should handle large values beyond TB', () => {
    // Should cap at TB
    expect(formatBytes(1125899906842624)).toBe('1024.00 TB');
  });
});
