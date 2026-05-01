/**
 * GlobalSnackbar - 全局 Snackbar 消息提示组件
 *
 * 提供可复用的 Toast 消息提示功能，支持两种使用方式：
 * 1. 作为受控组件使用：通过 props 控制显示状态
 * 2. 通过 useSnackbar Hook 使用：自动管理状态
 *
 * @module GlobalSnackbar
 * @version 1.0.0
 *
 * @example
 * ```tsx
 * // 方式一：受控组件
 * <GlobalSnackbar
 *   message="操作成功"
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   severity="success"
 * />
 *
 * // 方式二：Hook 方式
 * const { snackbarProps, showMessage } = useSnackbar();
 * showMessage('Hello!', { severity: 'info' });
 * ```
 */

import React, { JSX, useState } from 'react';
import { Snackbar, Alert, type SxProps, type Theme, alpha, Portal } from '@mui/material';

/**
 * Snackbar 消息严重程度类型
 * @description 决定 Alert 组件的颜色和图标
 * - success: 绿色，成功提示
 * - info: 蓝色，信息提示
 * - warning: 橙色，警告提示
 * - error: 红色，错误提示
 */
export type SnackbarSeverity = 'success' | 'info' | 'warning' | 'error';

/**
 * 重新导出 SnackbarProvider 组件
 * @description 提供 Context 方式的全局 Snackbar 功能
 */
export { SnackbarProvider } from './SnackbarProvider';

/**
 * GlobalSnackbar 组件的属性接口
 * @interface GlobalSnackbarProps
 */
export interface GlobalSnackbarProps {
  /** 消息内容，要显示的提示文本 */
  message: string;
  /** 是否显示 Snackbar */
  open: boolean;
  /** 关闭回调函数 */
  onClose: () => void;
  /** 消息级别，影响颜色和图标样式，默认 'info' */
  severity?: SnackbarSeverity;
  /** 自动隐藏时间（毫秒），设为 0 则不自动关闭，默认 2000 */
  autoHideDuration?: number;
  /** Snackbar 弹出位置，默认 { vertical: 'bottom', horizontal: 'center' } */
  anchorOrigin?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  /** 是否使用 Alert 组件包裹，false 则使用原生 Snackbar message，默认 true */
  showAlert?: boolean;
  /** 是否隐藏 Alert 图标，默认 false */
  hideIcon?: boolean;
  /** 自定义样式，透传给外层 Snackbar 组件 */
  sx?: SxProps<Theme>;
  /** 自定义样式，透传给内层 Alert 组件（仅 showAlert=true 时生效） */
  alertSx?: SxProps<Theme>;
}

/**
 * showMessage 方法的选项配置
 * @interface SnackbarOptions
 */
export interface SnackbarOptions {
  /** 消息级别：success | info | warning | error */
  severity?: SnackbarSeverity;
  /** 自动隐藏时间（毫秒），设为 0 则不自动关闭 */
  autoHideDuration?: number;
  /** 是否隐藏 Alert 图标 */
  hideIcon?: boolean;
  /** 是否使用 Alert 组件包裹 */
  showAlert?: boolean;
}

/**
 * useSnackbar Hook 的返回值类型
 * @interface UseSnackbarResult
 */
export interface UseSnackbarResult {
  /** 传递给 GlobalSnackbar 组件的属性对象 */
  snackbarProps: GlobalSnackbarProps;
  /** 显示消息的方法 */
  showMessage: (message: string, options?: SnackbarOptions) => void;
  /** 关闭消息的方法 */
  closeMessage: () => void;
}

/**
 * GlobalSnackbar 组件的默认属性配置
 * @description 提供类型安全的默认值选择
 */
const defaultProps: Required<
  Pick<
    GlobalSnackbarProps,
    'severity' | 'autoHideDuration' | 'anchorOrigin' | 'showAlert' | 'hideIcon'
  >
> = {
  severity: 'info',
  autoHideDuration: 2000,
  anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
  showAlert: true,
  hideIcon: false,
};

/**
 * GlobalSnackbar 组件
 *
 * 全局消息提示的展示组件，支持受控和非受控两种使用模式。
 * 使用 MUI Snackbar 和 Alert 组件实现消息提示功能。
 *
 * @param {GlobalSnackbarProps} props - 组件属性
 * @returns {JSX.Element}
 *
 * @remarks
 * - 使用 Portal 组件将 Snackbar 渲染到 body 末尾，避免 z-index 问题
 * - 默认位置在屏幕底部居中
 * - 自动设置高 z-index 确保显示在其他内容之上
 *
 * @example
 * ```tsx
 * // 受控模式
 * const [open, setOpen] = useState(false);
 * <GlobalSnackbar
 *   message="保存成功"
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   severity="success"
 * />
 * ```
 */
export function GlobalSnackbar({
  message,
  open,
  onClose,
  severity = defaultProps.severity,
  autoHideDuration = defaultProps.autoHideDuration,
  showAlert = defaultProps.showAlert,
  hideIcon = defaultProps.hideIcon,
}: GlobalSnackbarProps): JSX.Element {
  /**
   * 使用 Portal 将 Snackbar 传送到 DOM 顶层 (body 标签下)
   *
   * @description
   * Portal 的优势：
   * - 避免父容器 overflow、z-index 等样式影响
   * - 确保 Snackbar 始终显示在最顶层
   * - 避免与其他组件的样式冲突
   */
  return (
    <Portal>
      <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        disableWindowBlurListener
        sx={{
          zIndex: 999999,
          // 确保距离底部的间距，响应式设计适配不同屏幕
          bottom: { xs: '24px', sm: '24px' },
          // 固定宽度时使用 transform 实现真正的居中
          left: '50%',
          transform: 'translateX(-50%)',
          minWidth: '140px',
        }}
      >
        {showAlert ? (
          <Alert
            severity={severity}
            variant="filled"
            icon={hideIcon ? false : undefined}
            sx={{
              // 胶囊形状，现代化的设计风格
              borderRadius: '50px',
              px: 2.5,
              py: 0.2,
              minWidth: '140px',
              // 居中内容
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              // 粗体小字
              fontWeight: 800,
              fontSize: '0.75rem',
              // 移除默认渐变背景
              backgroundImage: 'none',
              // 添加阴影效果，颜色根据 severity 自动匹配主题色
              boxShadow: (theme: Theme) =>
                `0 12px 32px ${alpha(theme.palette[severity].main, 0.35)}`,
              // 图标样式：白色、稍大
              '& .MuiAlert-icon': { mr: 0.5, fontSize: '1.1rem', color: '#fff' },
              // 消息文字样式：白色、适当内边距
              '& .MuiAlert-message': { color: '#fff', padding: '6px 0' },
            }}
          >
            {message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Portal>
  );
}

/**
 * useSnackbar - 消息提示的 Hook 方式
 *
 * 提供状态管理的 Snackbar 功能，自动处理 open、message 等状态。
 * 适合在组件内部使用，无需额外的状态管理代码。
 *
 * @param {SnackbarOptions} [initialOptions] - 初始配置选项
 * @returns {UseSnackbarResult} 包含 snackbarProps 和操作方法的对象
 *
 * @description
 * - 自动管理 Snackbar 的显示/隐藏状态
 * - 支持链式调用 showMessage
 * - 合并初始选项和调用时选项
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { snackbarProps, showMessage, closeMessage } = useSnackbar({
 *     severity: 'info',
 *     autoHideDuration: 3000,
 *   });
 *
 *   const handleSave = () => {
 *     // 业务逻辑...
 *     showMessage('保存成功！', { severity: 'success' });
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={handleSave}>保存</button>
 *       <GlobalSnackbar {...snackbarProps} />
 *     </>
 *   );
 * }
 * ```
 */
export function useSnackbar(initialOptions?: SnackbarOptions): UseSnackbarResult {
  // Snackbar 显示状态
  const [open, setOpen] = useState(false);
  // 当前显示的消息内容
  const [message, setMessage] = useState('');
  // 消息配置选项
  const [options, setOptions] = useState<SnackbarOptions>(initialOptions || {});

  /**
   * 显示消息
   *
   * @param {string} newMessage - 要显示的消息文本
   * @param {SnackbarOptions} [newOptions={}] - 新的配置选项
   *
   * @description
   * - 合并初始选项和新的调用选项
   * - 新选项会覆盖初始选项
   */
  const showMessage = (newMessage: string, newOptions: SnackbarOptions = {}) => {
    setMessage(newMessage);
    setOptions({ ...initialOptions, ...newOptions });
    setOpen(true);
  };

  /**
   * 关闭消息
   *
   * @description
   * - 直接将 open 状态设置为 false
   */
  const closeMessage = () => {
    setOpen(false);
  };

  /**
   * 处理 Snackbar 关闭事件
   *
   * @param {React.SyntheticEvent | Event} [_event] - 关闭事件
   * @param {string} [reason] - 关闭原因：timeout | clickaway | escapeKeyDown
   *
   * @description
   * - 忽略 clickaway 原因（用户点击其他区域），防止误关闭
   * - 其他情况调用 closeMessage 关闭
   */
  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    closeMessage();
  };

  /**
   * 传递给 GlobalSnackbar 组件的属性
   *
   * @description
   * - 组合当前状态和选项为完整的组件 props
   * - onClose 使用 handleClose 包装后的版本
   */
  const snackbarProps: GlobalSnackbarProps = {
    message,
    open,
    onClose: handleClose,
    severity: options.severity,
    autoHideDuration: options.autoHideDuration,
    hideIcon: options.hideIcon,
  };

  return {
    snackbarProps,
    showMessage,
    closeMessage,
  };
}

/**
 * GlobalSnackbar 组件的默认导出
 * @description 方便使用 `import GlobalSnackbar from './GlobalSnackbar'` 方式导入
 */
export default GlobalSnackbar;
