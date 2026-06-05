/**
 * JSON 转 TOML 转换结果
 */
interface JsonToTomlResult {
  /** 转换后的 TOML 字符串 */
  output: string;
  /** 原始输入的字节大小 */
  originalBytes: number;
  /** 转换后的字节大小 */
  outputBytes: number;
}

/**
 * 将字符串转为 TOML 安全的双引号字符串
 * 转义规则：双引号、反斜杠、控制字符
 */
function stringifyTomlString(str: string): string {
  const escaped = str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t')
    .replace(/\r/g, '\\r');
  return `"${escaped}"`;
}

/**
 * 将 TOML 键转为安全形式
 * 简单键（仅字母、数字、连字符、下划线）直接输出，否则使用引号
 */
function stringifyTomlKey(key: string): string {
  if (/^[A-Za-z0-9_-]+$/.test(key)) {
    return key;
  }
  return stringifyTomlString(key);
}

/**
 * 将 JSON 基本值转换为 TOML 值字符串
 */
function toTomlValue(value: unknown): string {
  if (value === null) {
    // TOML 没有 null，使用空字符串表示
    return '""';
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'string') {
    return stringifyTomlString(value);
  }
  // 复杂类型不在此处处理
  return stringifyTomlString(String(value));
}

/**
 * 判断值是否为 TOML 基本类型（可直接内联表示）
 */
function isTomlPrimitive(value: unknown): boolean {
  return (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string'
  );
}

/**
 * 判断值是否为纯基本类型数组（所有元素都是基本类型）
 */
function isHomogeneousPrimitiveArray(arr: unknown[]): boolean {
  return arr.every(isTomlPrimitive);
}

/**
 * 将 JSON 值转换为 TOML 格式字符串
 *
 * @param value - 已解析的 JSON 值
 * @param path - 当前 TOML 表路径（用于嵌套对象生成 [table] 头部）
 * @param lines - 输出行收集器
 */
function toTomlLines(value: unknown, path: string[], lines: string[]): void {
  if (value === null || isTomlPrimitive(value)) {
    // 顶层的原始值，不生成有效 TOML（TOML 要求顶层是表）
    return;
  }

  if (Array.isArray(value)) {
    // 顶层数组：使用 TOML 的 table array 语法 [[path]]
    for (const item of value) {
      const header = path.length > 0 ? `[[${path.join('.')}]]` : '';
      if (header) {
        if (lines.length > 0 && lines[lines.length - 1] !== '') {
          lines.push('');
        }
        lines.push(header);
      }
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        processObjectEntries(item as Record<string, unknown>, path, lines);
      } else if (Array.isArray(item)) {
        // 嵌套数组
        toTomlLines(item, [...path], lines);
      } else if (isTomlPrimitive(item)) {
        // 不应该发生：数组中的原始值在顶层已处理
        lines.push(`value = ${toTomlValue(item)}`);
      }
    }
    return;
  }

  if (typeof value === 'object') {
    processObjectEntries(value as Record<string, unknown>, path, lines);
  }
}

/**
 * 处理对象的所有键值对，按 TOML 规范分类：
 * 1. 基本类型键值对（直接输出 key = value）
 * 2. 基本类型数组（直接输出 key = [v1, v2, ...]）
 * 3. 嵌套对象（生成 [table] 或 [[table]]）
 * 4. 嵌套数组中的对象（生成 [[table]]）
 */
function processObjectEntries(
  obj: Record<string, unknown>,
  parentPath: string[],
  lines: string[],
): void {
  const keys = Object.keys(obj);

  // 先输出基本类型键值对和基本类型数组
  for (const key of keys) {
    const value = obj[key];
    const tomlKey = stringifyTomlKey(key);

    if (isTomlPrimitive(value)) {
      lines.push(`${tomlKey} = ${toTomlValue(value)}`);
    } else if (Array.isArray(value) && isHomogeneousPrimitiveArray(value)) {
      const items = value.map(toTomlValue).join(', ');
      lines.push(`${tomlKey} = [${items}]`);
    }
  }

  // 再处理嵌套对象和对象数组
  for (const key of keys) {
    const value = obj[key];
    const currentPath = [...parentPath, key];

    if (isTomlPrimitive(value)) {
      // 已处理
      continue;
    }

    if (Array.isArray(value)) {
      if (isHomogeneousPrimitiveArray(value)) {
        // 已处理
        continue;
      }

      // 对象数组或其他复杂数组
      if (lines.length > 0 && lines[lines.length - 1] !== '') {
        lines.push('');
      }

      for (const item of value) {
        lines.push(`[[${currentPath.join('.')}]]`);
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          processObjectEntries(item as Record<string, unknown>, currentPath, lines);
        } else if (Array.isArray(item)) {
          toTomlLines(item, currentPath, lines);
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      // 嵌套对象 -> TOML 表
      if (lines.length > 0 && lines[lines.length - 1] !== '') {
        lines.push('');
      }
      lines.push(`[${currentPath.join('.')}]`);
      processObjectEntries(value as Record<string, unknown>, currentPath, lines);
    }
  }
}

/**
 * 将 JSON 字符串转换为 TOML 格式
 *
 * 注意：TOML 要求顶层必须是一个表（对象），因此如果输入是基本类型或数组，
 * 转换结果会将其包裹在虚拟键下。
 *
 * @param text - 输入的 JSON 字符串
 * @returns 转换结果
 * @throws {SyntaxError} 当输入不是有效的 JSON 时抛出语法错误
 * @throws {Error} 当顶层 JSON 值不是对象时抛出错误
 */
export function jsonToToml(text: string): JsonToTomlResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { output: '', originalBytes: 0, outputBytes: 0 };
  }

  const parsed: unknown = JSON.parse(trimmed);

  // TOML 要求顶层是表
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('TOML requires the top-level value to be an object');
  }

  const lines: string[] = [];
  toTomlLines(parsed, [], lines);

  const output = lines.join('\n').trim();
  const originalBytes = new TextEncoder().encode(trimmed).length;
  const outputBytes = new TextEncoder().encode(output).length;

  return { output, originalBytes, outputBytes };
}
