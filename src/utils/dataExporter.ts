/**
 * 数据导出工具
 * 实现 JSON 和 CSV 格式的数据导出
 */

import type { ExportFile } from '@/types/testDataGenerator';

/**
 * 数据导出器
 */
export class DataExporter {
  /**
   * 将数据转换为 JSON 字符串
   */
  static toJSON(data: Record<string, unknown>[], pretty = true): string {
    return JSON.stringify(data, null, pretty ? 2 : undefined);
  }

  /**
   * 将数据转换为 CSV 字符串
   */
  static toCSV(data: Record<string, unknown>[]): string {
    if (data.length === 0) return '';

    // 获取所有列名
    const headers = Array.from(new Set(data.flatMap((row) => Object.keys(row))));

    // 构建 CSV 内容
    const rows = [
      headers.map((h) => this.escapeCSV(h)).join(','),
      ...data.map((row) => headers.map((h) => this.escapeCSV(String(row[h] ?? ''))).join(',')),
    ];

    return rows.join('\n');
  }

  /**
   * 转义 CSV 字段
   */
  private static escapeCSV(value: string): string {
    // 如果包含逗号、引号、换行符，需要用引号包裹
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * 根据格式导出数据
   */
  static exportByFormat(data: Record<string, unknown>[], format: 'json' | 'csv'): string {
    if (format === 'csv') {
      return this.toCSV(data);
    }
    return this.toJSON(data);
  }

  /**
   * 导出为多个文件
   */
  static toMultipleFiles(
    data: Record<string, unknown>[],
    formats: ('json' | 'csv')[],
    filename = 'test-data',
  ): ExportFile[] {
    return formats.map((format) => ({
      filename,
      content: this.exportByFormat(data, format),
      mimeType: this.getMimeType(format),
    }));
  }

  /**
   * 导出为单个文件
   */
  static toSingleFile(
    data: Record<string, unknown>[],
    format: 'json' | 'csv',
    filename = 'test-data',
  ): ExportFile {
    return {
      filename,
      content: this.exportByFormat(data, format),
      mimeType: this.getMimeType(format),
    };
  }

  /**
   * 获取 MIME 类型
   */
  private static getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      json: 'application/json',
      csv: 'text/csv',
    };
    return mimeTypes[format] || 'application/octet-stream';
  }

  /**
   * 下载文件
   */
  static download(file: ExportFile): void {
    const blob = new Blob([file.content], { type: file.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.filename}.${file.mimeType === 'application/json' ? 'json' : 'csv'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * 下载多个文件
   */
  static downloadMultiple(files: ExportFile[]): void {
    files.forEach((file) => this.download(file));
  }

  /**
   * 复制到剪贴板
   */
  static async copyToClipboard(content: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch (error) {
      console.error('[DataExporter] 复制失败:', error);
      return false;
    }
  }
}
