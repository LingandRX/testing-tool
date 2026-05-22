import type { Dispatch, SetStateAction } from 'react'; // 💡 1. 显式解构导入类型，彻底掐灭 TS2304 报错
import { createContext, useContext } from 'react';
import type { QrCodeGeneratorState, QrCodeMode, QrCodeParserState } from '../types';

export interface QrCodeContextValue {
  // 核心主视图路由模式切换卡
  mode: QrCodeMode;
  setMode: (mode: QrCodeMode) => void;

  // 1. 流式生成器终端状态机驱动
  generatorState: QrCodeGeneratorState;
  setTextToEncode: (text: string) => void;
  // 💡 架构纯净化：物理剔除暴露给外部的命令式 generateQrCode 算子。
  // 外部面板只需 setTextToEncode 驱动源文本更新，生成动作由内部流式管线全自动自发自愈完成！
  downloadQrCode: () => void;
  copyQrCode: () => Promise<void>;

  // 2. 活态反向解析器终端状态机驱动
  parserState: QrCodeParserState;
  setParserState: Dispatch<SetStateAction<QrCodeParserState>>; // 💡 规整为纯净的直接类型使用
  parseQrCode: (file: File) => Promise<void>;
  handleFileChange: (file: File) => void;
  handleClearFile: () => void;
}

export const QrCodeContext = createContext<QrCodeContextValue | null>(null);

export function useQrCodeContext() {
  const context = useContext(QrCodeContext);
  if (!context) {
    // 边界鲁棒性防护大闸
    throw new Error('useQrCodeContext must be used within a valid QrCodeProvider container');
  }
  return context;
}
