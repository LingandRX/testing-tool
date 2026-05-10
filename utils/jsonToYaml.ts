/**
 * JSON 转 YAML 转换结果
 */
export interface JsonToYamlResult {
  /** 转换后的 YAML 字符串 */
  output: string;
  /** 原始输入的字节大小 */
  originalBytes: number;
  /** 转换后的字节大小 */
  outputBytes: number;
}

/**
 * 将 JSON 值转换为 YAML 字符串表示
 *
 * @param value - 已解析的 JSON 值
 * @param indent - 当前缩进级别
 * @returns YAML 字符串
 */
function toYamlString(value: unknown, indent: number): string {
  if (value === null) {
    return 'null';
  }
  if (value === true) {
    return 'true';
  }
  if (value === false) {
    return 'false';
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'string') {
    return stringifyYamlString(value);
  }
  if (Array.isArray(value)) {
    return arrayToYaml(value, indent);
  }
  if (typeof value === 'object') {
    return objectToYaml(value as Record<string, unknown>, indent);
  }
  return String(value);
}

/**
 * 将字符串转为 YAML 安全的表示
 * 对于包含特殊字符的字符串使用双引号包裹
 */
function stringifyYamlString(str: string): string {
  // 需要引号包裹的情况：空字符串、以特殊字符开头、包含特殊字符
  const needsQuoting =
    str === '' ||
    str === 'null' ||
    str === 'true' ||
    str === 'false' ||
    /[:#{}[\],&*?|>\-!%@`]/.test(str) ||
    str.startsWith(' ') ||
    str.endsWith(' ') ||
    str.includes(' ') ||
    str.includes('\n') ||
    /^\d/.test(str);

  if (!needsQuoting) {
    return str;
  }

  // 转义双引号和反斜杠，然后用双引号包裹
  const escaped = str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
  return `"${escaped}"`;
}

/**
 * 将 JSON 对象转换为 YAML 映射
 */
function objectToYaml(obj: Record<string, unknown>, indent: number): string {
  const prefix = '  '.repeat(indent);
  const keys = Object.keys(obj);

  if (keys.length === 0) {
    return '{}';
  }

  const lines: string[] = [];
  for (const key of keys) {
    const value = obj[key];
    const safeKey = /^[a-zA-Z0-9_-]+$/.test(key) ? key : stringifyYamlString(key);

    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.keys(value as Record<string, unknown>).length > 0
    ) {
      // 非空嵌套对象
      lines.push(`${prefix}${safeKey}:`);
      lines.push(toYamlString(value, indent + 1));
    } else if (Array.isArray(value) && value.length > 0) {
      // 非空数组
      lines.push(`${prefix}${safeKey}:`);
      lines.push(arrayToYaml(value, indent + 1));
    } else {
      // 基本值、空对象、空数组
      lines.push(`${prefix}${safeKey}: ${toYamlString(value, indent + 1)}`);
    }
  }

  return lines.join('\n');
}

/**
 * 将 JSON 数组转换为 YAML 序列
 */
function arrayToYaml(arr: unknown[], indent: number): string {
  const prefix = '  '.repeat(indent);

  if (arr.length === 0) {
    return `${prefix}[]`;
  }

  const lines: string[] = [];
  for (const item of arr) {
    if (
      item !== null &&
      typeof item === 'object' &&
      !Array.isArray(item) &&
      Object.keys(item as Record<string, unknown>).length > 0
    ) {
      // 数组中的非空对象
      const objLines = objectToYaml(item as Record<string, unknown>, indent + 1);
      lines.push(`${prefix}- ${objLines.trimStart()}`);
    } else if (Array.isArray(item) && item.length > 0) {
      // 数组中的非空数组
      lines.push(`${prefix}-`);
      lines.push(arrayToYaml(item, indent + 1));
    } else {
      // 基本值、空对象、空数组
      lines.push(`${prefix}- ${toYamlString(item, indent + 1)}`);
    }
  }

  return lines.join('\n');
}

/**
 * 将 JSON 字符串转换为 YAML 格式
 *
 * @param text - 输入的 JSON 字符串
 * @returns 转换结果
 * @throws {SyntaxError} 当输入不是有效的 JSON 时抛出语法错误
 */
export function jsonToYaml(text: string): JsonToYamlResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { output: '', originalBytes: 0, outputBytes: 0 };
  }

  const parsed: unknown = JSON.parse(trimmed);
  const output = toYamlString(parsed, 0);
  const originalBytes = new TextEncoder().encode(trimmed).length;
  const outputBytes = new TextEncoder().encode(output).length;

  return { output, originalBytes, outputBytes };
}
