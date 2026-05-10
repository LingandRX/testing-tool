import { describe, it, expect } from 'vitest';
import {
  textToBase64,
  base64ToText,
  isValidBase64,
  isFileSizeValid,
  isSupportedImageType,
  isSupportedImageExtension,
  extractMimeTypeFromDataUri,
  formatFileSize,
  MAX_FILE_SIZE,
} from '@/utils/base64Converter';

describe('textToBase64', () => {
  it('应该编码 ASCII 文本', () => {
    const result = textToBase64('Hello, World!');
    expect(result.output).toBe('SGVsbG8sIFdvcmxkIQ==');
    expect(result.originalBytes).toBe(13);
  });

  it('应该编码中文文本', () => {
    const result = textToBase64('你好世界');
    expect(result.output).toBeTruthy();
    // 验证可以正确解码回来
    const decoded = base64ToText(result.output);
    expect(decoded).toBe('你好世界');
  });

  it('应该编码空字符串', () => {
    const result = textToBase64('');
    expect(result.output).toBe('');
    expect(result.originalBytes).toBe(0);
  });

  it('应该编码包含特殊字符的文本', () => {
    const text = 'line1\nline2\ttab';
    const result = textToBase64(text);
    const decoded = base64ToText(result.output);
    expect(decoded).toBe(text);
  });

  it('应该编码 Unicode 表情符号', () => {
    const text = '🎉🚀';
    const result = textToBase64(text);
    const decoded = base64ToText(result.output);
    expect(decoded).toBe(text);
  });
});

describe('base64ToText', () => {
  it('应该解码标准 Base64 字符串', () => {
    const result = base64ToText('SGVsbG8sIFdvcmxkIQ==');
    expect(result).toBe('Hello, World!');
  });

  it('应该解码中文 Base64', () => {
    const encoded = textToBase64('测试文本');
    const decoded = base64ToText(encoded.output);
    expect(decoded).toBe('测试文本');
  });

  it('应该对无效 Base64 抛出错误', () => {
    expect(() => base64ToText('这不是base64!!!')).toThrow();
  });

  it('应该修剪输入字符串的空白', () => {
    const result = base64ToText('  SGVsbG8=  ');
    expect(result).toBe('Hello');
  });
});

describe('isValidBase64', () => {
  it('应该返回 true 对于合法的 Base64', () => {
    expect(isValidBase64('SGVsbG8=')).toBe(true);
    expect(isValidBase64('SGVsbG8sIFdvcmxkIQ==')).toBe(true);
  });

  it('应该返回 false 对于空字符串', () => {
    expect(isValidBase64('')).toBe(false);
  });

  it('应该返回 false 对于非法字符', () => {
    expect(isValidBase64('SGVsbG8!')).toBe(false);
  });

  it('应该返回 false 对于长度不是 4 的倍数', () => {
    expect(isValidBase64('SGVsbG8')).toBe(false); // 7 chars, not divisible by 4
  });
});

describe('isFileSizeValid', () => {
  it('应该对正常大小的文件返回 true', () => {
    expect(isFileSizeValid(1024)).toBe(true);
    expect(isFileSizeValid(MAX_FILE_SIZE)).toBe(true);
  });

  it('应该对 0 字节返回 false', () => {
    expect(isFileSizeValid(0)).toBe(false);
  });

  it('应该对超出限制的文件返回 false', () => {
    expect(isFileSizeValid(MAX_FILE_SIZE + 1)).toBe(false);
  });

  it('应该对负数返回 false', () => {
    expect(isFileSizeValid(-1)).toBe(false);
  });
});

describe('isSupportedImageType', () => {
  it('应该识别支持的图像类型', () => {
    expect(isSupportedImageType('image/png')).toBe(true);
    expect(isSupportedImageType('image/jpeg')).toBe(true);
    expect(isSupportedImageType('image/webp')).toBe(true);
    expect(isSupportedImageType('image/gif')).toBe(true);
    expect(isSupportedImageType('image/svg+xml')).toBe(true);
  });

  it('应该拒绝不支持的 MIME 类型', () => {
    expect(isSupportedImageType('application/pdf')).toBe(false);
    expect(isSupportedImageType('text/plain')).toBe(false);
    expect(isSupportedImageType('video/mp4')).toBe(false);
  });
});

describe('isSupportedImageExtension', () => {
  it('应该识别支持的图像扩展名', () => {
    expect(isSupportedImageExtension('photo.png')).toBe(true);
    expect(isSupportedImageExtension('photo.JPG')).toBe(true);
    expect(isSupportedImageExtension('photo.webp')).toBe(true);
    expect(isSupportedImageExtension('photo.gif')).toBe(true);
  });

  it('应该拒绝不支持的扩展名', () => {
    expect(isSupportedImageExtension('document.pdf')).toBe(false);
    expect(isSupportedImageExtension('video.mp4')).toBe(false);
  });
});

describe('extractMimeTypeFromDataUri', () => {
  it('应该从 data URI 中提取 MIME 类型', () => {
    expect(extractMimeTypeFromDataUri('data:image/png;base64,iVBOR')).toBe('image/png');
    expect(extractMimeTypeFromDataUri('data:text/plain;base64,SGVsbG8=')).toBe('text/plain');
  });

  it('应该对无效的 data URI 返回默认类型', () => {
    expect(extractMimeTypeFromDataUri('invalid')).toBe('application/octet-stream');
  });
});

describe('formatFileSize', () => {
  it('应该格式化字节', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(512)).toBe('512 B');
  });

  it('应该格式化 KB', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('应该格式化 MB', () => {
    expect(formatFileSize(1048576)).toBe('1.00 MB');
  });

  it('应该格式化 GB', () => {
    expect(formatFileSize(1073741824)).toBe('1.00 GB');
  });
});
