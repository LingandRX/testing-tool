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

/** 二维码生成器组件的 Props */
export interface QrCodeGeneratorProps {
  /** 输入文本 */
  textToEncode: string;
  /** 输入文本变更回调 */
  onTextChange: (text: string) => void;
  /** 生成的二维码 Data URL */
  qrCodeDataUrl: string;
  /** 二维码 Data URL 变更回调 */
  onQrCodeDataUrlChange: (dataUrl: string) => void;
  /** 是否正在生成 */
  generating: boolean;
  /** 生成状态变更回调 */
  onGeneratingChange: (generating: boolean) => void;
  /** 输入错误信息 */
  inputError: string;
  /** 输入错误变更回调 */
  onInputErrorChange: (error: string) => void;
  /** 展开状态 */
  expanded: boolean;
  /** 展开状态变更回调 */
  onExpandedChange: (expanded: boolean) => void;
  /** 是否强制展开（桌面端） */
  forceExpanded?: boolean;
}

/** 二维码预览组件的 Props */
export interface QrCodePreviewProps {
  /** 二维码 Data URL */
  qrCodeDataUrl: string;
  /** 下载回调 */
  onDownload: () => void;
  /** 复制回调 */
  onCopy: () => void;
  /** 是否正在生成 */
  generating?: boolean;
}

/** 图片上传器组件的 Props */
export interface ImageUploaderProps {
  /** 选中的文件 */
  selectedFile: File | null;
  /** 文件变更回调 */
  onFileChange: (file: File) => void;
  /** 清除文件回调 */
  onClearFile: () => void;
  /** 文件预览 URL */
  previewUrl: string;
  /** 是否正在拖拽 */
  dragging: boolean;
  /** 拖拽状态变更回调 */
  onDraggingChange: (dragging: boolean) => void;
}

/** 二维码解析器组件的 Props */
export interface QrCodeParserProps {
  /** 解析结果文本 */
  decodedResult: string;
  /** 解析结果变更回调 */
  onDecodedResultChange: (result: string) => void;
  /** 是否正在解析 */
  parsing: boolean;
  /** 解析状态变更回调 */
  onParsingChange: (parsing: boolean) => void;
  /** 解析错误信息 */
  parseError: string;
  /** 解析错误变更回调 */
  onParseErrorChange: (error: string) => void;
  /** 选中的文件 */
  selectedFile: File | null;
  /** 文件变更回调 */
  onFileChange: (file: File) => void;
  /** 清除文件回调 */
  onClearFile: () => void;
  /** 文件预览 URL */
  previewUrl: string;
  /** 预览 URL 变更回调 */
  onPreviewUrlChange: (url: string) => void;
  /** 是否正在拖拽 */
  dragging: boolean;
  /** 拖拽状态变更回调 */
  onDraggingChange: (dragging: boolean) => void;
  /** 展开状态 */
  expanded: boolean;
  /** 展开状态变更回调 */
  onExpandedChange: (expanded: boolean) => void;
  /** 是否强制展开（桌面端） */
  forceExpanded?: boolean;
}
