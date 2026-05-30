/**
 * 二维码工具页面的状态类型定义
 */

/** 二维码功能核心主路由模式 */
export type QrCodeMode = 'generate' | 'parse';

/** 生成器的操作步骤 */
export type GeneratorStep = 'input' | 'preview';

/** * 二维码生成器的状态
 * 💡 架构优化：采用两步操作模式（输入态 → 预览态），
 * 用户显式点击生成按钮后才生成二维码，体验更清晰！
 */
export interface QrCodeGeneratorState {
  /** 当前操作步骤：输入态或预览态 */
  step: GeneratorStep;
  /** 受控的输入源文本（支持 URL 或任意文本快照） */
  textToEncode: string;
  /** 保存的文本快照，用于预览态展示和编辑态回填 */
  savedText: string;
  /** 由用户显式触发生成的二维码 Base64 Data URL */
  qrCodeDataUrl: string;
  /** 是否正在生成 */
  generating: boolean;
  /** 输入文本校验或底层画布崩溃的错误提示信息 */
  inputError: string;
}

/** * 二维码解析器的状态
 * 反向活态图片读取终端的流式驱动核心
 */
export interface QrCodeParserState {
  /** 解析解密出的原始文本结果 */
  decodedResult: string;
  /** 异步文件系统/画布读取时的后台线程状态锁 */
  parsing: boolean;
  /** 图像由于残缺、无矩阵或非标准二维码引发的解析错误信息 */
  parseError: string;
  /** 当前被拖拽、粘贴或点击选中的 File 原生文件句柄 */
  selectedFile: File | null;
  /** 内存沙箱级别的原生 Blob/File 图片临时预览虚拟 URL */
  previewUrl: string;
  /** 用户鼠标拖拽文件在边界内滑移悬停的活态状态大闸 */
  dragging: boolean;
}
