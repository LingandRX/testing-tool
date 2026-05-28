declare module 'qrious' {
  interface QRiousOptions {
    value?: string;
    size?: number;
    level?: 'L' | 'M' | 'Q' | 'H';
    foreground?: string;
    background?: string;
    padding?: number;
    mime?: string;
  }

  class QRious {
    constructor(options?: QRiousOptions);
    toDataURL(mime?: string): string;
    set(options: QRiousOptions): void;
  }

  export = QRious;
}
