/**
 * Base64 转换器工具函数
 */

import { formatBytes } from './format';

/** 最大文件大小限制（10 MB） */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** 支持的图像 MIME 类型 */
export const SUPPORTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/svg+xml',
  'image/x-icon',
] as const;

/** 支持的图像文件扩展名 */
export const SUPPORTED_IMAGE_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.bmp',
  '.svg',
  '.ico',
] as const;

/**
 * 文本转 Base64 编码结果
 */
export interface TextToBase64Result {
  /** Base64 编码结果 */
  output: string;
  /** 原始字节数 */
  originalBytes: number;
  /** 编码后字节数 */
  outputBytes: number;
}

/**
 * 文件转 Base64 编码结果
 */
export interface FileToBase64Result {
  /** Base64 编码结果（含 data URI 前缀） */
  output: string;
  /** 纯 Base64 字符串（不含前缀） */
  rawBase64: string;
  /** 原始字节数 */
  originalBytes: number;
  /** 编码后字节数 */
  outputBytes: number;
  /** 文件名 */
  fileName: string;
  /** 文件 MIME 类型 */
  mimeType: string;
}

/**
 * 将文本字符串编码为 Base64
 *
 * @param text 输入文本
 * @returns 编码结果
 */
export function textToBase64(text: string): TextToBase64Result {
  const encoded = btoa(unescape(encodeURIComponent(text)));
  const originalBytes = new TextEncoder().encode(text).length;
  const outputBytes = new TextEncoder().encode(encoded).length;
  return {
    output: encoded,
    originalBytes,
    outputBytes,
  };
}

/** 匹配 data URI 的 base64 前缀，如 "data:image/png;base64,"（允许中间含参数） */
const DATA_URI_BASE64_PREFIX = /^data:[^,]+;base64,/i;

/**
 * 将 Base64 字符串解码为文本
 *
 * 支持 data:<mime>;base64,<payload> 形式：会自动剥离前缀后再解码。
 * 若解码出的字节不是合法 UTF-8（典型如图片等二进制数据），抛出更易懂的错误。
 *
 * @param base64 Base64 编码字符串
 * @returns 解码后的文本
 * @throws {Error} 输入不是合法的 Base64 字符串
 * @throws {Error} 输入解码后是二进制数据，无法作为文本展示
 */
export function base64ToText(base64: string): string {
  const trimmed = base64.trim();
  const cleaned = trimmed.replace(DATA_URI_BASE64_PREFIX, '');
  if (!isValidBase64(cleaned)) {
    throw new Error('Invalid Base64 string');
  }
  try {
    return decodeURIComponent(escape(atob(cleaned)));
  } catch {
    throw new Error(
      'Input appears to be binary data (e.g. an image). Please use the Image tab instead.',
    );
  }
}

/**
 * 校验字符串是否为合法的 Base64 编码
 *
 * @param str 待校验字符串
 * @returns 是否合法
 */
export function isValidBase64(str: string): boolean {
  if (!str || str.length === 0) return false;
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  if (!base64Regex.test(str)) return false;
  if (str.length % 4 !== 0) return false;
  try {
    atob(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * 校验文件大小是否在限制范围内
 *
 * @param fileSize 文件大小（字节）
 * @returns 是否合法
 */
export function isFileSizeValid(fileSize: number): boolean {
  return fileSize > 0 && fileSize <= MAX_FILE_SIZE;
}

/**
 * 校验 MIME 类型是否为支持的图像类型
 *
 * @param mimeType MIME 类型
 * @returns 是否为支持的图像类型
 */
export function isSupportedImageType(mimeType: string): boolean {
  return (SUPPORTED_IMAGE_TYPES as readonly string[]).includes(mimeType);
}

/**
 * 校验文件扩展名是否为支持的图像格式
 *
 * @param fileName 文件名
 * @returns 是否为支持的图像格式
 */
export function isSupportedImageExtension(fileName: string): boolean {
  const lowerName = fileName.toLowerCase();
  return (SUPPORTED_IMAGE_EXTENSIONS as readonly string[]).some((ext) => lowerName.endsWith(ext));
}

/**
 * 将文件转换为 Base64 编码（使用 FileReader 异步读取）
 *
 * @param file 文件对象
 * @returns Promise<FileToBase64Result> 编码结果
 * @throws {Error} 如果文件为空或超出大小限制
 */
export function fileToBase64(file: File): Promise<FileToBase64Result> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    if (!isFileSizeValid(file.size)) {
      reject(new Error(`File size exceeds the limit (${MAX_FILE_SIZE / 1024 / 1024} MB)`));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const dataUri = reader.result as string;
      const commaIndex = dataUri.indexOf(',');
      const rawBase64 = commaIndex >= 0 ? dataUri.substring(commaIndex + 1) : dataUri;

      resolve({
        output: dataUri,
        rawBase64,
        originalBytes: file.size,
        outputBytes: rawBase64.length,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
      });
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 从 data URI 中提取 MIME 类型
 *
 * @param dataUri data URI 字符串
 * @returns MIME 类型
 */
export function extractMimeTypeFromDataUri(dataUri: string): string {
  const match = dataUri.match(/^data:([^;,]+)[^,]*;base64,/);
  return match ? match[1] : 'application/octet-stream';
}

/**
 * 格式化文件大小显示
 *
 * @deprecated 直接使用 {@link formatBytes} 代替
 * @param bytes 字节数
 * @returns 格式化后的字符串
 */
export function formatFileSize(bytes: number): string {
  return formatBytes(bytes);
}

/**
 * Base64 解码为二进制后的产物
 */
export interface Base64ToBlobResult {
  /** 解码后的 Blob */
  blob: Blob;
  /** 推断出的 MIME 类型 */
  mimeType: string;
  /** 推荐的扩展名，含点（如 `.png`），无法识别时为 `.bin` */
  suggestedExtension: string;
  /** 已去除 data URI 前缀的纯 Base64 字符串 */
  rawBase64: string;
}

/**
 * 已知文件类型魔数签名表。注意：ZIP 头同样会匹配 .docx/.xlsx/.pptx/.apk
 *
 * 签名匹配规则：
 * - `bytes` 必须匹配文件起始
 * - 可选的 `tail` 用于多段签名（如 WebP："RIFF" + 偏移 8 处的 "WEBP"）
 */
const MAGIC_BYTE_SIGNATURES: ReadonlyArray<{
  bytes: readonly number[];
  tail?: { offset: number; bytes: readonly number[] };
  mime: string;
  ext: string;
}> = [
  { bytes: [0x89, 0x50, 0x4e, 0x47], mime: 'image/png', ext: '.png' },
  { bytes: [0xff, 0xd8, 0xff], mime: 'image/jpeg', ext: '.jpg' },
  { bytes: [0x47, 0x49, 0x46, 0x38], mime: 'image/gif', ext: '.gif' },
  { bytes: [0x42, 0x4d], mime: 'image/bmp', ext: '.bmp' },
  {
    bytes: [0x52, 0x49, 0x46, 0x46],
    tail: { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] },
    mime: 'image/webp',
    ext: '.webp',
  },
  { bytes: [0x25, 0x50, 0x44, 0x46], mime: 'application/pdf', ext: '.pdf' },
  { bytes: [0x50, 0x4b, 0x03, 0x04], mime: 'application/zip', ext: '.zip' },
];

/**
 * 将 Base64 字符串解码为 Uint8Array
 *
 * @param b64 纯 Base64 字符串（不含 data URI 前缀）
 * @returns 字节序列
 */
export function base64ToBytes(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

/**
 * 根据字节序列前缀识别已知文件类型
 *
 * @param bytes 解码后的字节序列
 * @returns 匹配到的 MIME + 扩展名；未匹配返回 null
 */
export function sniffMimeFromBytes(bytes: Uint8Array): { mime: string; ext: string } | null {
  for (const sig of MAGIC_BYTE_SIGNATURES) {
    if (bytes.length < sig.bytes.length) continue;
    if (!sig.bytes.every((b, i) => bytes[i] === b)) continue;
    if (sig.tail) {
      const { offset, bytes: tailBytes } = sig.tail;
      if (bytes.length < offset + tailBytes.length) continue;
      if (!tailBytes.every((b, i) => bytes[offset + i] === b)) continue;
    }
    return { mime: sig.mime, ext: sig.ext };
  }
  return null;
}

/**
 * 将 Base64 / data URI 字符串解码为 Blob，自动推断 MIME 与扩展名
 *
 * MIME 推断优先级：data URI 前缀 → 字节魔数 → `application/octet-stream`
 *
 * @param input Base64 字符串或 data URI
 * @returns 解码结果
 * @throws {Error} 输入不是合法 Base64
 */
export function base64ToBlob(input: string): Base64ToBlobResult {
  const trimmed = input.trim();
  const prefixMatch = trimmed.match(DATA_URI_BASE64_PREFIX);
  const cleaned = prefixMatch ? trimmed.slice(prefixMatch[0].length) : trimmed;

  if (!isValidBase64(cleaned)) {
    throw new Error('Invalid Base64 string');
  }

  const bytes = base64ToBytes(cleaned);

  let mimeType: string;
  let suggestedExtension: string;
  if (prefixMatch) {
    mimeType = extractMimeTypeFromDataUri(trimmed);
    const sniffed = sniffMimeFromBytes(bytes);
    suggestedExtension = sniffed?.ext ?? mimeTypeToExtension(mimeType);
  } else {
    const sniffed = sniffMimeFromBytes(bytes);
    mimeType = sniffed?.mime ?? 'application/octet-stream';
    suggestedExtension = sniffed?.ext ?? '.bin';
  }

  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: mimeType });
  return { blob, mimeType, suggestedExtension, rawBase64: cleaned };
}

/** 极小的 MIME -> 扩展名映射，仅用于带 data URI 前缀但魔数无法识别时 */
function mimeTypeToExtension(mime: string): string {
  if (mime.startsWith('image/svg')) return '.svg';
  if (mime === 'image/webp') return '.webp';
  if (mime === 'image/bmp') return '.bmp';
  if (mime === 'image/x-icon' || mime === 'image/vnd.microsoft.icon') return '.ico';
  if (mime === 'text/plain') return '.txt';
  if (mime === 'application/json') return '.json';
  if (mime === 'text/html') return '.html';
  if (mime === 'text/css') return '.css';
  return '.bin';
}

/**
 * 触发浏览器下载指定 Blob
 *
 * @param blob 要下载的 Blob
 * @param filename 下载文件名
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
