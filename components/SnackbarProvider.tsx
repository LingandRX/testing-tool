/**
 * SnackbarProvider - 全局 Snackbar 消息提示 Provider
 *
 * 提供全局的 Toast 消息功能，支持成功、错误、警告、信息四种提示类型。
 * 通过 React Context 向下传递消息显示方法，子组件可通过 useSnackbar hook 调用。
 *
 * @description
 * - 使用 MUI Snackbar 组件实现消息提示
 * - 支持自定义自动隐藏时长
 * - 消息会显示在页面底部居中位置
 * - 使用 Portal 将 Snackbar 渲染到 body 末尾，避免 z-index 层级问题
 */

import { createContext, useContext, useState, useCallback, type ReactNode, JSX } from 'react';
import { Snackbar, Alert, Portal } from '@mui/material';
import type { SnackbarSeverity, SnackbarOptions } from './GlobalSnackbar';

/**
 * Snackbar Context 的值类型定义
 * @interface SnackbarContextValue
 * @property showMessage - 显示消息的方法
 * @property closeMessage - 关闭消息的方法
 */
interface SnackbarContextValue {
  showMessage: (message: string, options?: SnackbarOptions) => void;
  closeMessage: () => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

/**
 * SnackbarProvider 组件的 props 类型
 * @interface SnackbarProviderProps
 * @property children - 子组件
 */
interface SnackbarProviderProps {
  children: ReactNode;
}

/**
 * SnackbarProvider 组件
 *
 * 全局消息提示的 Provider 组件，需要包裹在应用根组件外层。
 * 提供 showMessage 方法用于显示各种类型的提示消息。
 *
 * @param {SnackbarProviderProps} props - 组件属性
 * @returns {JSX.Element}
 *
 * @example
 * ```tsx
 * <SnackbarProvider>
 *   <App />
 * </SnackbarProvider>
 * ```
 *
 * @example
 * ```tsx
 * // 在子组件中使用
 * const { showMessage } = useSnackbar();
 * showMessage('操作成功', { severity: 'success' });
 * ```
 */
export function SnackbarProvider({ children }: SnackbarProviderProps): JSX.Element {
  // Snackbar 的显示状态
  const [open, setOpen] = useState(false);
  // 当前显示的消息内容
  const [message, setMessage] = useState('');
  // 消息的严重程度类型，决定 Alert 的颜色和图标
  const [severity, setSeverity] = useState<SnackbarSeverity>('info');
  // 自动隐藏的延迟时间（毫秒），默认 2000ms
  const [autoHideDuration, setAutoHideDuration] = useState<number>(2000);

  /**
   * 显示消息的处理函数
   *
   * @param {string} newMessage - 要显示的消息文本
   * @param {SnackbarOptions} [options={}] - 可选的配置项
   * @param {SnackbarSeverity} [options.severity] - 消息类型：success | error | warning | info
   * @param {number} [options.autoHideDuration] - 自定义自动隐藏时长
   *
   * @description
   * - 使用 useCallback 缓存函数引用，避免不必要的重渲染
   * - 更新消息内容、类型和自动隐藏时长后打开 Snackbar
   */
  const showMessage = useCallback((newMessage: string, options: SnackbarOptions = {}) => {
    setMessage(newMessage);
    if (options.severity) setSeverity(options.severity);
    if (options.autoHideDuration !== undefined) setAutoHideDuration(options.autoHideDuration);
    setOpen(true);
  }, []);

  /**
   * 关闭消息的处理函数
   *
   * @description
   * - 将 open 状态设置为 false，关闭 Snackbar
   * - 使用 useCallback 缓存函数引用
   */
  const closeMessage = useCallback(() => {
    setOpen(false);
  }, []);

  /**
   * Snackbar 关闭事件的处理函数
   *
   * @param {React.SyntheticEvent | Event} [_event] - 关闭事件对象（未使用）
   * @param {string} [reason] - 关闭原因：timeout | clickaway | escapeKeyDown
   *
   * @description
   * - 阻止点击away自动关闭（用户点击其他区域时不关闭）
   * - 其他情况调用 closeMessage 关闭 Snackbar
   */
  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    closeMessage();
  };

  return (
    // 通过 Context Provider 向下传递 snackbar 操作方法
    <SnackbarContext.Provider value={{ showMessage, closeMessage }}>
      {children}
      {/*
        Portal 组件：将 Snackbar 渲染到 body 的末尾位置
        优点：避免父元素 z-index 或 overflow 等样式影响 Snackbar 的显示
      */}
      <Portal>
        <Snackbar
          open={open}
          autoHideDuration={autoHideDuration}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          disableWindowBlurListener
          sx={{
            zIndex: 999999,
            bottom: { xs: '24px', sm: '24px' },
          }}
        >
          {/*
            Alert 组件：显示提示信息的核心组件
            - severity: 控制颜色和图标
            - variant="filled": 使用填充样式，更醒目
            - 自定义样式：圆形边角、居中显示、白色文字
          */}
          <Alert
            severity={severity}
            variant="filled"
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
              '& .MuiAlert-icon': { mr: 0.5, fontSize: '1.1rem', color: '#fff' },
              '& .MuiAlert-message': { color: '#fff', padding: '6px 0' },
            }}
          >
            {message}
          </Alert>
        </Snackbar>
      </Portal>
    </SnackbarContext.Provider>
  );
}

/**
 * useSnackbar Hook 选项配置
 * @interface UseSnackbarOptions
 * @property autoHideDuration - 默认自动隐藏时长（当前版本未使用，预留接口）
 */
export interface UseSnackbarOptions {
  autoHideDuration?: number;
}

/**
 * useSnackbar - 在子组件中获取 Snackbar 上下文的 Hook
 *
 * @param {UseSnackbarOptions} [_options] - 可选的配置项（当前版本未使用）
 * @returns {SnackbarContextValue} - 包含 showMessage 和 closeMessage 的对象
 * @throws {Error} - 如果不在 SnackbarProvider 内部调用，抛出错误
 *
 * @description
 * 这是一个自定义 React Hook，用于在任意子组件中访问 Snackbar 功能。
 * 必须确保组件被 SnackbarProvider 包裹才能使用。
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { showMessage } = useSnackbar();
 *
 *   const handleSuccess = () => {
 *     showMessage('操作成功！', { severity: 'success' });
 *   };
 *
 *   const handleError = () => {
 *     showMessage('发生错误', { severity: 'error', autoHideDuration: 3000 });
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleSuccess}>成功提示</button>
 *       <button onClick={handleError}>错误提示</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSnackbar(_options?: UseSnackbarOptions): SnackbarContextValue {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within SnackbarProvider');
  }
  return context;
}

export default SnackbarProvider;
