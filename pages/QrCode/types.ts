/**
 * 二维码工具页面的状态类型定义
 */

/** 二维码功能核心主路由模式 */
export type QrCodeMode = 'generate' | 'parse';

/** * 二维码生成器的状态
 * 💡 架构优化：保留与全局 Context 骨架契合的形态，
 * 外部依然可以流畅读取这些状态，但在新架构下运行效率和稳定性大幅提升！
 */
export interface QrCodeGeneratorState {
  /** 受控的输入源文本（支持 URL 或任意文本快照） */
  textToEncode: string;
  /** 由防抖源文本流在单次渲染内存中同步派生出的二维码 Base64 Data URL */
  qrCodeDataUrl: string;
  /** 是否正在生成（流式架构下已默认为恒定 false 的非阻塞快照，保留作为 UI 骨架兼容） */
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
