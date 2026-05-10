/**
 * JSON 格式化选项
 */
export interface JsonFormatOptions {
  /** 缩进空格数，默认 2 */
  indentSize: number;
  /** 是否按键名字母顺序排序，默认 false */
  sortKeys: boolean;
}

/**
 * JSON 格式化结果
 */
export interface JsonFormatResult {
  /** 格式化后的 JSON 字符串 */
  formatted: string;
  /** 原始输入的字节大小 */
  originalBytes: number;
  /** 格式化后的字节大小 */
  formattedBytes: number;
}

/**
 * 递归对 JSON 对象的键进行字母排序
 *
 * @param obj - 要排序的对象
 * @returns 键排序后的新对象
 */
function sortObjectKeys(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  const sorted: Record<string, unknown> = {};
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  for (const key of keys) {
    sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
  }
  return sorted;
}

/**
 * 格式化 JSON 字符串
 *
 * @param text - 输入的 JSON 字符串（可以是压缩或格式混乱的）
 * @param options - 格式化选项
 * @returns 格式化结果
 * @throws {SyntaxError} 当输入不是有效的 JSON 时抛出语法错误
 */
export function formatJson(text: string, options: JsonFormatOptions): JsonFormatResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { formatted: '', originalBytes: 0, formattedBytes: 0 };
  }

  let parsed: unknown = JSON.parse(trimmed);

  if (options.sortKeys) {
    parsed = sortObjectKeys(parsed);
  }

  const formatted = JSON.stringify(parsed, null, options.indentSize);
  const originalBytes = new TextEncoder().encode(trimmed).length;
  const formattedBytes = new TextEncoder().encode(formatted).length;

  return { formatted, originalBytes, formattedBytes };
}

/**
 * JSON 压缩结果
 */
export interface JsonMinifyResult {
  /** 压缩后的 JSON 字符串 */
  minified: string;
  /** 原始输入的字节大小 */
  originalBytes: number;
  /** 压缩后的字节大小 */
  minifiedBytes: number;
}

/**
 * 压缩 JSON 字符串
 *
 * 将格式化的 JSON 字符串压缩为单行，移除所有不必要的空白字符、换行符和缩进。
 *
 * @param text - 输入的 JSON 字符串
 * @returns 压缩结果
 * @throws {SyntaxError} 当输入不是有效的 JSON 时抛出语法错误
 */
export function minifyJson(text: string): JsonMinifyResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { minified: '', originalBytes: 0, minifiedBytes: 0 };
  }

  const parsed: unknown = JSON.parse(trimmed);
  const minified = JSON.stringify(parsed);
  const originalBytes = new TextEncoder().encode(trimmed).length;
  const minifiedBytes = new TextEncoder().encode(minified).length;

  return { minified, originalBytes, minifiedBytes };
}

/**
 * 校验 JSON 字符串是否有效
 *
 * @param text - 输入的 JSON 字符串
 * @returns 如果有效返回 null，否则返回错误消息
 */
export function validateJson(text: string): string | null {
  if (!text.trim()) {
    return null;
  }
  try {
    JSON.parse(text.trim());
    return null;
  } catch (e) {
    if (e instanceof SyntaxError) {
      return e.message;
    }
    return String(e);
  }
}
