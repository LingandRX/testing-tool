/**
 * GlobalSnackbar - 全局 Snackbar 消息提示组件及 Provider
 *
 * 提供可复用的 Toast 消息提示功能，支持三种使用方式：
 * 1. 作为受控组件使用：通过 props 控制显示状态
 * 2. 通过 useSnackbarState Hook 使用：在组件内部自动管理状态
 * 3. 通过 SnackbarProvider 和 useSnackbar Hook 使用：全局单例模式
 *
 * @module GlobalSnackbar
 * @version 1.1.0
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
 * // 方式二：Hook 方式 (局部状态)
 * const { snackbarProps, showMessage } = useSnackbarState();
 * showMessage('Hello!', { severity: 'info' });
 *
 * // 方式三：Context 方式 (全局状态)
 * // 在根组件包裹 Provider
 * <SnackbarProvider>
 *   <App />
 * </SnackbarProvider>
 *
 * // 在子组件中使用
 * const { showMessage } = useSnackbar();
 * showMessage('Global Message');
 * ```
 */

import React, { JSX, useState, createContext, useContext, type ReactNode } from 'react';
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
 * useSnackbarState Hook 的返回值类型
 * @interface UseSnackbarStateResult
 */
export interface UseSnackbarStateResult {
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
          bottom: { xs: '24px', sm: '24px' },
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
              borderRadius: '50px',
              px: 2.5,
              py: 0.2,
              minWidth: '140px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.75rem',
              backgroundImage: 'none',
              boxShadow: (theme: Theme) =>
                `0 12px 32px ${alpha(theme.palette[severity].main, 0.35)}`,
              '& .MuiAlert-icon': { mr: 0.5, fontSize: '1.1rem', color: '#fff' },
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
 * useSnackbarState - 消息提示的状态管理 Hook
 *
 * 提供状态管理的 Snackbar 功能，自动处理 open、message 等状态。
 *
 * @param {SnackbarOptions} [initialOptions] - 初始配置选项
 * @returns {UseSnackbarStateResult} 包含 snackbarProps 和操作方法的对象
 */
export function useSnackbarState(initialOptions?: SnackbarOptions): UseSnackbarStateResult {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [options, setOptions] = useState<SnackbarOptions>(initialOptions || {});

  const showMessage = (newMessage: string, newOptions: SnackbarOptions = {}) => {
    setMessage(newMessage);
    setOptions({ ...initialOptions, ...newOptions });
    setOpen(true);
  };

  const closeMessage = () => {
    setOpen(false);
  };

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    closeMessage();
  };

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

// --- Context & Provider ---

/**
 * Snackbar Context 的值类型定义
 */
interface SnackbarContextValue {
  showMessage: (message: string, options?: SnackbarOptions) => void;
  closeMessage: () => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

/**
 * SnackbarProvider 组件的 props 类型
 */
interface SnackbarProviderProps {
  children: ReactNode;
  initialOptions?: SnackbarOptions;
}

/**
 * SnackbarProvider 组件
 *
 * 全局消息提示的 Provider 组件，需要包裹在应用根组件外层。
 */
export function SnackbarProvider({ children, initialOptions }: SnackbarProviderProps): JSX.Element {
  const { snackbarProps, showMessage, closeMessage } = useSnackbarState(initialOptions);

  return (
    <SnackbarContext.Provider value={{ showMessage, closeMessage }}>
      {children}
      <GlobalSnackbar {...snackbarProps} />
    </SnackbarContext.Provider>
  );
}

/**
 * useSnackbar - 在子组件中获取 Snackbar 上下文的 Hook
 *
 * @param {SnackbarOptions} [options] - 钩子级别的默认配置（如 autoHideDuration）
 * @returns {SnackbarContextValue} - 包含 showMessage 和 closeMessage 的对象
 * @throws {Error} - 如果不在 SnackbarProvider 内部调用，抛出错误
 *
 * @description
 * 选项合并策略：
 * 1. 调用 showMessage 时传入的 callOptions 优先级最高
 * 2. useSnackbar(options) 传入的 Hook 级别配置次之
 * 3. SnackbarProvider(initialOptions) 传入的全局配置优先级最低
 */
export function useSnackbar(options?: SnackbarOptions): SnackbarContextValue {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within SnackbarProvider');
  }

  // 包装 showMessage 以支持 Hook 级别的 initialOptions
  const wrappedShowMessage = (message: string, callOptions?: SnackbarOptions) => {
    // 采用防御性编程，确保 options 和 callOptions 为空时也能正常工作
    // 优先级：callOptions > options
    const mergedOptions: SnackbarOptions = {
      ...(options || {}),
      ...(callOptions || {}),
    };
    context.showMessage(message, mergedOptions);
  };

  return {
    ...context,
    showMessage: wrappedShowMessage,
  };
}

export default GlobalSnackbar;
