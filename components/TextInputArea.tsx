/**
 * TextInputArea - 多行文本输入组件
 *
 * 提供功能丰富的多行文本输入体验，支持受控/非受控模式、验证规则、
 * 字符计数、工具栏操作、复制/清空等交互能力。
 *
 * @module TextInputArea
 *
 * @example
 * ```tsx
 * // 基础用法
 * <TextInputArea placeholder="请输入内容..." />
 *
 * // 受控模式
 * <TextInputArea value={text} onChange={setText} />
 *
 * // 带验证规则
 * <TextInputArea
 *   rules={[{ validator: (v) => v.length >= 3, message: '至少3个字符' }]}
 *   validateTrigger="onBlur"
 * />
 *
 * // 带操作按钮
 * <TextInputArea
 *   actions={[
 *     { key: 'submit', label: '提交', type: 'primary', onClick: handleSubmit },
 *   ]}
 * />
 * ```
 */

import { useRef, useState, useCallback, forwardRef, RefObject } from 'react';
import { X, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SnackbarOptions } from '@/components/GlobalSnackbar';

/** 文本验证规则 */
export type ValidateRule = {
  /** 验证函数，返回 true 表示通过 */
  validator: (value: string) => boolean;
  /** 验证失败时的提示消息 */
  message: string;
};

/** 工具栏操作按钮配置 */
export type ToolbarAction = {
  /** 唯一标识 */
  key: string;
  /** 按钮显示文本 */
  label: string;
  /** 按钮图标 */
  icon?: React.ReactNode;
  /** 按钮位置：顶部或底部，默认顶部 */
  position?: 'top' | 'bottom';
  /** 按钮样式类型：主要/默认/危险 */
  type?: 'primary' | 'default' | 'danger';
  /** 禁用条件，可以是布尔值或根据当前值动态判断的函数 */
  disabled?: boolean | ((value: string) => boolean);
  /** 点击回调，接收当前值和操作辅助方法 */
  onClick: (value: string, helpers: { clear: () => void; setError: (msg: string) => void }) => void;
};

export interface TextInputAreaProps {
  /** 受控模式下的当前值 */
  value?: string;
  /** 非受控模式下的初始值，组件挂载时有效 */
  defaultValue?: string;
  /** 值变化回调 */
  onChange?: (value: string) => void;
  /** 占位文本 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readOnly?: boolean;
  /** 是否自动聚焦 */
  autoFocus?: boolean;

  /** 最小行数（autoResize 为 true 时生效） */
  minRows?: number;
  /** 最大行数（autoResize 为 true 时生效） */
  maxRows?: number;
  /** 最大字符数限制 */
  maxLength?: number;
  /** 外层容器类名 */
  className?: string;
  /** 外层容器样式 */
  style?: React.CSSProperties;
  /** 外层容器 sx */
  sx?: React.CSSProperties;

  /** 是否显示字符计数 */
  showCount?: boolean;
  /** 是否显示清空按钮，默认 true */
  showClear?: boolean;
  /** 是否允许复制内容 */
  allowCopy?: boolean;
  /** 是否启用自动调整高度，默认 true */
  autoResize?: boolean;

  /** 验证规则列表 */
  rules?: ValidateRule[];
  /** 验证触发时机：失焦(onBlur) / 输入时(onChange) / 操作前(onAction)，默认 onAction */
  validateTrigger?: 'onBlur' | 'onChange' | 'onAction';

  /** 工具栏操作按钮列表 */
  actions?: ToolbarAction[];
  /** 顶部栏左侧额外内容 */
  topExtra?: React.ReactNode;

  /** 顶部栏标题 */
  title?: string;

  /** 消息提示回调，用于展示 Toast 通知 */
  showMessage?: (message: string, options?: SnackbarOptions) => void;

  /** 外部错误消息，由父组件控制，优先于内部验证错误 */
  externalError?: string;

  /** 清空按钮点击后的额外回调 */
  onClear?: () => void;
}

/** ActionButton 内部组件的属性 */
interface ActionButtonProps {
  action: ToolbarAction;
  value: string;
  globalDisabled: boolean;
  variant?: 'text' | 'contained';
  onAction: (action: ToolbarAction) => void;
  size?: 'small' | 'medium';
  compact?: boolean;
}

/**
 * 工具栏操作按钮 - 根据 action.type 自动应用样式
 *
 * - primary：填充主色背景
 * - danger：红色文字 + 悬停红色背景
 * - default（默认）：灰色文字 + 悬停灰色背景
 */
function ActionButton({
  action,
  value,
  globalDisabled,
  variant: _variant = 'text',
  onAction,
  size = 'small',
  compact,
}: ActionButtonProps) {
  const isBtnDisabled =
    typeof action.disabled === 'function' ? action.disabled(value) : action.disabled || !value;

  const typeClasses: Record<string, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    danger: 'text-red-600 hover:bg-red-50',
    default: 'text-gray-500 hover:bg-gray-50',
  };

  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-3 py-1.5',
  };

  return (
    <button
      type="button"
      onClick={() => onAction(action)}
      disabled={isBtnDisabled || globalDisabled}
      className={`rounded-md font-semibold transition-colors ${sizeClasses[size]} ${
        typeClasses[action.type || 'default']
      } ${compact ? 'text-xs px-2 min-w-0' : 'text-sm'} ${
        isBtnDisabled || globalDisabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {action.icon && <span className="mr-1">{action.icon}</span>}
      {action.label}
    </button>
  );
}

/**
 * TextInputArea 组件
 *
 * 多行文本输入组件，支持受控/非受控双模式、验证规则、工具栏操作等。
 * 使用 forwardRef 暴露底层 textarea DOM 节点。
 */
const TextInputArea = forwardRef<HTMLTextAreaElement, TextInputAreaProps>((props, ref) => {
  const {
    value: controlledValue,
    defaultValue = '',
    onChange,
    placeholder: placeholderProp,
    disabled = false,
    readOnly = false,
    autoFocus = false,
    minRows = 4,
    maxRows = 12,
    maxLength,
    className = '',
    style,
    sx: containerSx,
    showCount = false,
    showClear = true,
    allowCopy = false,
    autoResize = true,
    rules = [],
    validateTrigger = 'onAction',
    actions = [],
    topExtra,
    title,
    showMessage,
    externalError,
    onClear,
  } = props;

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [error, setError] = useState<string>('');

  const { t } = useTranslation('common');
  const placeholder = placeholderProp ?? t('textInputArea.placeholder');

  /** 通过 value prop 是否存在来判断是否为受控模式 */
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  /** 外部错误优先级高于内部验证错误 */
  const displayError = externalError ?? error;

  /**
   * 执行所有验证规则
   * @param trigger - 触发验证的事件类型，用于匹配 validateTrigger
   */
  const validate = useCallback(
    (val: string, trigger?: string): boolean => {
      if (validateTrigger !== trigger && trigger) return true;
      for (const rule of rules) {
        if (!rule.validator(val)) {
          setError(rule.message);
          return false;
        }
      }
      setError('');
      return true;
    },
    [rules, validateTrigger],
  );

  /** 输入变化处理：更新值、清空错误、按需触发验证 */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    if (maxLength && newVal.length > maxLength) {
      const msg = t('charCount', { count: maxLength });
      setError(msg);
      showMessage?.(msg, { severity: 'warning' });
      return;
    }

    if (!isControlled) setInternalValue(newVal);
    onChange?.(newVal);

    if (error) setError('');
    if (validateTrigger === 'onChange') validate(newVal, 'onChange');
  };

  /** 失焦时按需触发验证 */
  const handleBlur = () => {
    if (validateTrigger === 'onBlur') validate(value, 'onBlur');
  };

  /** 清空输入内容并重新聚焦 */
  const handleClear = useCallback(() => {
    if (!isControlled) setInternalValue('');
    onChange?.('');
    setError('');
    textareaRef.current?.focus();
    showMessage?.(t('textInputArea.cleared'), { severity: 'success' });
    onClear?.();
  }, [isControlled, onChange, showMessage, t, onClear]);

  /** 复制当前内容到剪贴板 */
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      showMessage?.(t('messages.copySuccess'), { severity: 'success' });
    } catch {
      setError(t('messages.copyError'));
      showMessage?.(t('messages.copyError'), { severity: 'error' });
    }
  }, [value, showMessage, t]);

  /** 执行工具栏操作：检查禁用状态、验证、调用 onClick */
  const handleAction = useCallback(
    (action: ToolbarAction) => {
      const isDisabled =
        typeof action.disabled === 'function' ? action.disabled(value) : action.disabled;

      if (isDisabled || disabled) return;

      if (validateTrigger === 'onAction' && !validate(value, 'onAction')) {
        return;
      }

      action.onClick(value, {
        clear: handleClear,
        setError,
      });
    },
    [value, disabled, validate, validateTrigger, handleClear],
  );

  /** 合并内部 ref 和外部传入的 forwardRef */
  const handleInputRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as RefObject<HTMLTextAreaElement | null>).current = node;
      }
    },
    [ref],
  );

  const topActions = actions.filter((a) => a.position !== 'bottom');
  const bottomActions = actions.filter((a) => a.position === 'bottom');

  const hasTopBar = title || showCount || topActions.length > 0 || topExtra;

  return (
    <div className={className} style={{ ...style, ...containerSx }}>
      {hasTopBar && (
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-3">
            {title && <span className="text-sm font-semibold text-gray-500">{title}</span>}
            {topExtra}
          </div>

          <div className="flex items-center gap-1">
            {topActions.map((action) => (
              <ActionButton
                key={action.key}
                action={action}
                value={value}
                globalDisabled={disabled}
                onAction={handleAction}
                compact
              />
            ))}
            {showCount && (
              <span className="text-xs text-gray-400 tabular-nums ml-1">
                {value.length}
                {maxLength ? ` / ${maxLength}` : ''}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="relative">
        <textarea
          ref={handleInputRef}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          autoFocus={autoFocus}
          readOnly={readOnly}
          rows={autoResize ? undefined : minRows}
          style={{
            minHeight: autoResize ? `${minRows * 1.5}rem` : undefined,
            maxHeight: autoResize ? `${maxRows * 1.5}rem` : undefined,
          }}
          className={`w-full rounded-lg border ${
            displayError ? 'border-red-300' : 'border-gray-200'
          } bg-white px-3 py-3 font-mono text-sm leading-relaxed transition-all resize-y ${
            showClear || allowCopy || bottomActions.length > 0 ? 'pb-10' : ''
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white hover:bg-gray-50 ${
            displayError ? 'focus:ring-red-500' : ''
          }`}
        />

        {(showClear || allowCopy || bottomActions.length > 0) && (
          <div
            className={`absolute right-3 flex items-center gap-1 z-10 ${
              displayError ? 'bottom-8' : 'bottom-2'
            }`}
          >
            {bottomActions.map((action) => (
              <ActionButton
                key={action.key}
                action={action}
                value={value}
                globalDisabled={disabled}
                variant={action.type === 'primary' ? 'contained' : 'text'}
                onAction={handleAction}
              />
            ))}
            {allowCopy && value && (
              <button
                type="button"
                onClick={handleCopy}
                title={t('textInputArea.copyContent')}
                className="p-1 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Copy className="h-4 w-4" />
              </button>
            )}
            {showClear && value && !disabled && !readOnly && (
              <button
                type="button"
                onClick={handleClear}
                title={t('textInputArea.clear')}
                className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {displayError && <p className="mt-1 text-xs font-semibold text-red-500">{displayError}</p>}
      </div>
    </div>
  );
});

TextInputArea.displayName = 'TextInputArea';

export default TextInputArea;
