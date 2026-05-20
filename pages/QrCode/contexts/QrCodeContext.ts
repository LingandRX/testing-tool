import { createContext, useContext } from 'react';
import type { QrCodeMode, QrCodeGeneratorState, QrCodeParserState } from '../types';

export interface QrCodeContextValue {
  // 模式
  mode: QrCodeMode;
  setMode: (mode: QrCodeMode) => void;

  // 生成器状态
  generatorState: QrCodeGeneratorState;
  setTextToEncode: (text: string) => void;
  generateQrCode: (text: string) => Promise<void>;
  downloadQrCode: () => void;
  copyQrCode: () => Promise<void>;

  // 解析器状态
  parserState: QrCodeParserState;
  setParserState: React.Dispatch<React.SetStateAction<QrCodeParserState>>;
  parseQrCode: (file: File) => Promise<void>;
  handleFileChange: (file: File) => void;
  handleClearFile: () => void;
}

export const QrCodeContext = createContext<QrCodeContextValue | null>(null);

export function useQrCodeContext() {
  const context = useContext(QrCodeContext);
  if (!context) {
    throw new Error('useQrCodeContext must be used within QrCodeProvider');
  }
  return context;
}
