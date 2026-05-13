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

/**
 * 将 Base64 字符串解码为文本
 *
 * @param base64 Base64 编码字符串
 * @returns 解码后的文本
 * @throws {Error} 如果输入不是有效的 Base64 字符串
 */
export function base64ToText(base64: string): string {
  const cleaned = base64.trim();
  if (!isValidBase64(cleaned)) {
    throw new Error('Invalid Base64 string');
  }
  return decodeURIComponent(escape(atob(cleaned)));
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
  const match = dataUri.match(/^data:([^;]+);base64,/);
  return match ? match[1] : 'application/octet-stream';
}

/**
 * 格式化文件大小显示（兼容旧接口，内部委托给 formatBytes）
 *
 * @param bytes 字节数
 * @returns 格式化后的字符串
 */
export function formatFileSize(bytes: number): string {
  return formatBytes(bytes);
}
