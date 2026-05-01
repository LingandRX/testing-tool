/**
 * SnackbarProvider - 全局 Snackbar 消息提示 Provider
 *
 * 提供全局的 Toast 消息功能，支持成功、错误、警告、信息四种提示类型。
 * 通过 React Context 向下传递消息显示方法，子组件可通过 useSnackbar hook 调用。
 *
 * @description
 * - 基于 GlobalSnackbar 组件实现，复用其状态管理逻辑
 * - 使用 MUI Snackbar 组件实现消息提示
 * - 支持自定义自动隐藏时长
 * - 消息会显示在页面底部居中位置
 * - 使用 Portal 将 Snackbar 渲染到 body 末尾，避免 z-index 层级问题
 */

import { createContext, useContext, type ReactNode } from 'react';
import GlobalSnackbar, { useSnackbarState } from './GlobalSnackbar';
import type { SnackbarOptions } from './GlobalSnackbar';

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

/**
 * React Context，用于在组件树中传递 Snackbar 操作方法
 * @description
 * - 初始值为 null，表示未包裹在 Provider 中
 * - 通过 SnackbarProvider 包裹后提供实际值
 */
const SnackbarContext = createContext<SnackbarContextValue | null>(null);

/**
 * SnackbarProvider 组件的 props 类型
 * @interface SnackbarProviderProps
 * @property children - 子组件
 * @property initialOptions - 初始配置选项
 */
interface SnackbarProviderProps {
  children: ReactNode;
  initialOptions?: SnackbarOptions;
}

/**
 * useSnackbar Hook 的选项配置（与 GlobalSnackbar 的 SnackbarOptions 兼容）
 * @interface UseSnackbarOptions
 * @property severity - 消息严重程度
 * @property autoHideDuration - 默认自动隐藏时长
 * @property hideIcon - 是否隐藏图标
 * @property showAlert - 是否使用 Alert 组件
 */
export type UseSnackbarOptions = SnackbarOptions;

/**
 * SnackbarProvider 组件
 *
 * 全局消息提示的 Provider 组件，需要包裹在应用根组件外层。
 * 提供 showMessage 方法用于显示各种类型的提示消息。
 *
 * @param {SnackbarProviderProps} props - 组件属性
 * @returns {JSX.Element}
 *
 * @remarks
 * - 使用 useGlobalSnackbar() hook 复用 GlobalSnackbar 的状态管理逻辑
 * - 通过 Context.Provider 将操作方法传递给子组件
 * - 渲染 GlobalSnackbar 组件显示实际的 Snackbar UI
 *
 * @example
 * ```tsx
 * <SnackbarProvider initialOptions={{ autoHideDuration: 3000 }}>
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
export function SnackbarProvider({ children, initialOptions }: SnackbarProviderProps) {
  /**
   * 调用 GlobalSnackbar.useSnackbar() 获取状态管理逻辑
   *
   * @description
   * - snackbarProps: 传递给 GlobalSnackbar 组件的属性
   * - showMessage: 显示消息的方法
   * - closeMessage: 关闭消息的方法
   */
  const { snackbarProps, showMessage, closeMessage } = useSnackbarState(initialOptions);

  /**
   * 通过 Context.Provider 向下传递 snackbar 操作方法
   *
   * @description
   * - 子组件通过 useSnackbar() hook 获取这些方法
   * - GlobalSnackbar 组件放在 Provider 外部，确保它能渲染到 DOM
   */
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
 * @param {UseSnackbarOptions} [_options] - 可选的配置项（保留向后兼容性，不实际使用）
 * @returns {SnackbarContextValue} - 包含 showMessage 和 closeMessage 的对象
 * @throws {Error} - 如果不在 SnackbarProvider 内部调用，抛出错误
 *
 * @description
 * 这是一个自定义 React Hook，用于在任意子组件中访问 Snackbar 功能。
 * 必须确保组件被 SnackbarProvider 包裹才能使用。
 *
 * @remarks
 * - 由于 Context 限制，useSnackbar 的 options 参数无法动态传递给 Provider
 * - 如需设置全局初始选项，请在 SnackbarProvider 组件上设置 initialOptions
 * - 如需为单个消息设置选项，请在 showMessage() 方法中传入
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { showMessage } = useSnackbar();
 *
 *   const handleSuccess = () => {
 *     showMessage('操作成功！', { severity: 'success', autoHideDuration: 5000 });
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleSuccess}>成功提示</button>
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
