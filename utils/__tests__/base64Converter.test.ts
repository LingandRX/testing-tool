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
  base64ToBytes,
  sniffMimeFromBytes,
  base64ToBlob,
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

  it('应该自动剥离 data:<mime>;base64, 前缀后再解码', () => {
    // "hello" -> base64 "aGVsbG8="
    const result = base64ToText('data:text/plain;base64,aGVsbG8=');
    expect(result).toBe('hello');
  });

  it('应该剥离带空白的 data URI 前缀', () => {
    const result = base64ToText('  data:text/plain;base64,aGVsbG8=  ');
    expect(result).toBe('hello');
  });

  it('应该对二进制（如 PNG）数据抛出更清晰的错误', () => {
    // PNG 文件签名 89 50 4E 47 0D 0A 1A 0A 的 Base64 编码
    const pngSignatureBase64 = 'iVBORw0KGgo=';
    expect(() => base64ToText(pngSignatureBase64)).toThrow(/binary|二进制|image|图像/i);
  });

  it('应该对带 data:image/png 前缀的 PNG 数据抛出二进制错误', () => {
    const pngDataUri = 'data:image/png;base64,iVBORw0KGgo=';
    expect(() => base64ToText(pngDataUri)).toThrow(/binary|二进制|image|图像/i);
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

describe('base64ToBytes', () => {
  it('应该解码标准 ASCII Base64 为字节序列', () => {
    const bytes = base64ToBytes('aGVsbG8=');
    expect(Array.from(bytes)).toEqual([0x68, 0x65, 0x6c, 0x6c, 0x6f]);
  });

  it('应该正确解码 PNG 文件签名', () => {
    // PNG 签名：89 50 4E 47 0D 0A 1A 0A
    const bytes = base64ToBytes('iVBORw0KGgo=');
    expect(Array.from(bytes)).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  });

  it('应该返回空 Uint8Array 对于空字符串输入', () => {
    const bytes = base64ToBytes('');
    expect(bytes.length).toBe(0);
  });
});

describe('sniffMimeFromBytes', () => {
  it('应该识别 PNG', () => {
    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(sniffMimeFromBytes(bytes)).toEqual({ mime: 'image/png', ext: '.png' });
  });

  it('应该识别 JPEG', () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
    expect(sniffMimeFromBytes(bytes)).toEqual({ mime: 'image/jpeg', ext: '.jpg' });
  });

  it('应该识别 GIF', () => {
    const bytes = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
    expect(sniffMimeFromBytes(bytes)).toEqual({ mime: 'image/gif', ext: '.gif' });
  });

  it('应该识别 PDF', () => {
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
    expect(sniffMimeFromBytes(bytes)).toEqual({ mime: 'application/pdf', ext: '.pdf' });
  });

  it('应该识别 ZIP', () => {
    const bytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
    expect(sniffMimeFromBytes(bytes)).toEqual({ mime: 'application/zip', ext: '.zip' });
  });

  it('应该对未匹配的字节返回 null', () => {
    const bytes = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
    expect(sniffMimeFromBytes(bytes)).toBeNull();
  });

  it('应该对过短的字节返回 null', () => {
    const bytes = new Uint8Array([0x89]);
    expect(sniffMimeFromBytes(bytes)).toBeNull();
  });
});

describe('base64ToBlob', () => {
  it('应该优先使用 data URI 中的 MIME 类型', () => {
    const result = base64ToBlob('data:application/json;base64,eyJhIjoxfQ==');
    expect(result.mimeType).toBe('application/json');
    expect(result.blob).toBeInstanceOf(Blob);
    expect(result.blob.size).toBe(7);
  });

  it('应该通过魔数识别 PNG', () => {
    const result = base64ToBlob('iVBORw0KGgo=');
    expect(result.mimeType).toBe('image/png');
    expect(result.suggestedExtension).toBe('.png');
  });

  it('应该通过魔数识别 PDF', () => {
    // "%PDF-" + 一些字节
    const result = base64ToBlob('JVBERi0K');
    expect(result.mimeType).toBe('application/pdf');
    expect(result.suggestedExtension).toBe('.pdf');
  });

  it('应该对未匹配的纯 Base64 回退为 application/octet-stream + .bin', () => {
    const result = base64ToBlob('AAECAwQF');
    expect(result.mimeType).toBe('application/octet-stream');
    expect(result.suggestedExtension).toBe('.bin');
  });

  it('应该 trim 前后空白', () => {
    const result = base64ToBlob('  iVBORw0KGgo=  ');
    expect(result.mimeType).toBe('image/png');
  });

  it('应该对非法 Base64 抛出 Invalid Base64 string', () => {
    expect(() => base64ToBlob('这不是 base64!')).toThrow('Invalid Base64 string');
  });

  it('应该返回原始 Base64（已去除 data URI 前缀）', () => {
    const result = base64ToBlob('data:image/png;base64,iVBORw0KGgo=');
    expect(result.rawBase64).toBe('iVBORw0KGgo=');
  });

  it('blob 大小应该等于解码后的字节数', () => {
    const result = base64ToBlob('aGVsbG8=');
    expect(result.blob.size).toBe(5);
  });
});
