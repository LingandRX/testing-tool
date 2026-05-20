/**
 * 二维码工具页面的状态类型定义
 */

/** 二维码生成模式 */
export type QrCodeMode = 'generate' | 'parse';

/** 二维码生成器的状态 */
export interface QrCodeGeneratorState {
  /** 输入文本（URL 或任意文本） */
  textToEncode: string;
  /** 生成的二维码 Data URL */
  qrCodeDataUrl: string;
  /** 是否正在生成 */
  generating: boolean;
  /** 输入错误信息 */
  inputError: string;
}

/** 二维码解析器的状态 */
export interface QrCodeParserState {
  /** 解析结果文本 */
  decodedResult: string;
  /** 是否正在解析 */
  parsing: boolean;
  /** 解析错误信息 */
  parseError: string;
  /** 当前选中的文件 */
  selectedFile: File | null;
  /** 文件预览 URL */
  previewUrl: string;
  /** 是否正在拖拽 */
  dragging: boolean;
}
