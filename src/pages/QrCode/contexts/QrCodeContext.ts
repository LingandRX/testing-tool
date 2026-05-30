import type { Dispatch, SetStateAction } from 'react';
import { createContext, useContext } from 'react';
import type { QrCodeGeneratorState, QrCodeMode, QrCodeParserState } from '../types';

export interface QrCodeContextValue {
  mode: QrCodeMode;
  setMode: (mode: QrCodeMode) => void;

  generatorState: QrCodeGeneratorState;
  setTextToEncode: (text: string) => void;
  /** 显式触发生成二维码并切换到预览态 */
  confirmGenerate: () => void;
  /** 返回编辑态，保留上次输入内容 */
  backToEdit: () => void;

  downloadQrCode: () => void;
  copyQrCode: () => Promise<void>;

  parserState: QrCodeParserState;
  setParserState: Dispatch<SetStateAction<QrCodeParserState>>;
  parseQrCode: (file: File) => Promise<void>;
  handleFileChange: (file: File) => void;
  handleClearFile: () => void;
}

export const QrCodeContext = createContext<QrCodeContextValue | null>(null);

export function useQrCodeContext() {
  const context = useContext(QrCodeContext);
  if (!context) {
    throw new Error('useQrCodeContext must be used within a valid QrCodeProvider container');
  }
  return context;
}
