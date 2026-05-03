/**
 * 文本统计信息接口
 */
export interface TextStats {
  /** 字符数（包含空格和特殊字符） */
  characters: number;
  /** 单词数 */
  words: number;
  /** 行数 */
  lines: number;
  /** 字节大小 */
  bytes: number;
}

/**
 * 计算文本统计信息
 *
 * @param text 输入的文本内容
 * @returns 统计结果对象
 */
export function getTextStats(text: string): TextStats {
  if (!text) {
    return { characters: 0, words: 0, lines: 0, bytes: 0 };
  }

  // 1. 字符数：统计总字符数量
  const characters = text.length;

  // 2. 单词数：使用 Intl.Segmenter 识别单词边界
  // 这能很好地处理中英文混合文本。中文会按词组切分，英文按单词切分。
  let words = 0;
  try {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' });
    const segments = segmenter.segment(text);
    for (const segment of segments) {
      // isWordLike 为 true 表示该片段是“类词”的（非空格、非标点）
      if (segment.isWordLike) {
        words++;
      }
    }
  } catch {
    // 降级方案：如果不支持 Intl.Segmenter，使用正则匹配英文单词
    // 但对中文支持较差
    const englishWords = text.match(/\b\w+\b/g) || [];
    const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || [];
    words = englishWords.length + chineseChars.length;
  }

  // 3. 行数：统计换行符数量
  // 空字符串已在上方处理。非空文本至少有一行。
  const lines = text.split('\n').length;

  // 4. 字节大小：计算文本内容的字节数 (UTF-8)
  const bytes = new TextEncoder().encode(text).length;

  return { characters, words, lines, bytes };
}

/**
 * 格式化字节大小显示
 *
 * @param bytes 字节数
 * @returns 格式化后的字符串，例如 "100 Bytes"
 */
export function formatByteSize(bytes: number): string {
  return `${bytes} Bytes`;
}
