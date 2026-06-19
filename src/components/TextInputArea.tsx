import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner'; // 推荐使用 shadcn 的默认 Toast
import { CopyButton } from '@/components/CopyButton';
import { Button } from './ui/button';

export type ValidateRule = {
  validator: (value: string) => boolean;
  message: string;
};

export type ToolbarAction = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  position?: 'top' | 'bottom';
  type?: 'primary' | 'default' | 'danger';
  disabled?: boolean | ((value: string) => boolean);
  onClick: (value: string, helpers: { clear: () => void; setError: (msg: string) => void }) => void;
};

export interface TextInputAreaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'onChange'
> {
  value?: string;
  defaultValue?: string;

  /** 值变化回调，返回最新的字符串内容 */
  onChange?: (value: string) => void;

  minRows?: number;
  maxRows?: number;
  showCount?: boolean;
  showClear?: boolean;
  allowCopy?: boolean;
  rules?: ValidateRule[];
  validateTrigger?: 'onBlur' | 'onChange' | 'onAction';
  actions?: ToolbarAction[];
  topExtra?: React.ReactNode;
  title?: string;
  externalError?: string;
  onClear?: () => void;
}

// 提炼基础的 ActionButton，全面向 shadcn 核心 Button 样式对齐
function ActionButton({
  action,
  value,
  globalDisabled,
  onAction,
}: {
  action: ToolbarAction;
  value: string;
  globalDisabled: boolean;
  onAction: (action: ToolbarAction) => void;
}) {
  const isBtnDisabled =
    typeof action.disabled === 'function' ? action.disabled(value) : (action.disabled ?? false);

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
    danger: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
    default:
      'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
  };

  return (
    <button
      type="button"
      onClick={() => onAction(action)}
      disabled={isBtnDisabled || globalDisabled}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors h-7 px-2.5',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[action.type || 'default'],
      )}
    >
      {action.icon && <span className="mr-1.5 h-3.5 w-3.5 flex items-center">{action.icon}</span>}
      {action.label}
    </button>
  );
}

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
    className,
    showCount = false,
    showClear = true,
    allowCopy = false,
    rules = [],
    validateTrigger = 'onAction',
    actions = [],
    topExtra,
    title,
    externalError,
    onClear,
    ...restProps
  } = props;

  const internalRef = useRef<HTMLTextAreaElement | null>(null);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [error, setError] = useState<string>('');

  const placeholder = placeholderProp ?? '请输入文本';

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;
  const displayError = externalError ?? error;

  useImperativeHandle(ref, () => internalRef.current as HTMLTextAreaElement);

  const adjustHeight = useCallback(() => {
    const textArea = internalRef.current;
    if (!textArea) return;

    // 重置高度计算
    textArea.style.height = 'auto';

    const computedMin = minRows * 24;
    const computedMax = maxRows * 24;
    const nextHeight = Math.max(textArea.scrollHeight, computedMin);

    textArea.style.height = `${Math.min(nextHeight, computedMax)}px`;
  }, [minRows, maxRows]);

  React.useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    if (maxLength && newVal.length > maxLength) {
      const msg = `内容不能超过 ${maxLength} 个字符`;
      setError(msg);
      toast.warning(msg);
      return;
    }

    if (!isControlled) setInternalValue(newVal);
    onChange?.(newVal);

    if (error) setError('');
    if (validateTrigger === 'onChange') validate(newVal, 'onChange');
  };

  const handleBlur = () => {
    if (validateTrigger === 'onBlur') validate(value, 'onBlur');
  };

  const handleClear = useCallback(() => {
    if (!isControlled) setInternalValue('');
    onChange?.('');
    setError('');
    internalRef.current?.focus();
    toast.success('已清空');
    onClear?.();
  }, [isControlled, onChange, onClear]);

  const handleAction = useCallback(
    (action: ToolbarAction) => {
      const isDisabled =
        typeof action.disabled === 'function' ? action.disabled(value) : action.disabled;
      if (isDisabled || disabled) return;

      if (validateTrigger === 'onAction' && !validate(value, 'onAction')) return;

      action.onClick(value, {
        clear: handleClear,
        setError,
      });
    },
    [value, disabled, validate, validateTrigger, handleClear],
  );

  const topActions = actions.filter((a) => a.position !== 'bottom');
  const bottomActions = actions.filter((a) => a.position === 'bottom');
  const hasTopBar = title || showCount || topActions.length > 0 || topExtra;
  const hasBottomBar = allowCopy || showClear || bottomActions.length > 0;

  return (
    <div className={cn('w-full flex flex-col gap-1.5', className)}>
      {hasTopBar && (
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            {title && <span className="text-xs font-semibold text-muted-foreground">{title}</span>}
            {topExtra}
          </div>
          <div className="flex items-center gap-1.5">
            {topActions.map((action) => (
              <ActionButton
                key={action.key}
                action={action}
                value={value}
                globalDisabled={disabled}
                onAction={handleAction}
              />
            ))}
            {showCount && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {value.length}
                {maxLength ? ` / ${maxLength}` : ''}
              </span>
            )}
          </div>
        </div>
      )}

      <div
        className={cn(
          'rounded-md border border-input bg-background shadow-sm transition-all focus-within:ring-1 focus-within:ring-ring focus-within:border-input overflow-hidden',
          displayError &&
            'border-destructive focus-within:ring-destructive focus-within:border-destructive',
        )}
      >
        <textarea
          ref={internalRef}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          autoFocus={autoFocus}
          readOnly={readOnly}
          placeholder={placeholder}
          className="w-full bg-transparent px-4 py-3 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none border-0 block"
          {...restProps}
        />

        {hasBottomBar && (
          <div className="flex h-10 items-center justify-between px-4 bg-muted/30 border-t border-border/50">
            {/* 左侧自定义动作 */}
            <div className="flex items-center gap-1.5 min-w-0">
              {bottomActions.map((action) => (
                <ActionButton
                  key={action.key}
                  action={action}
                  value={value}
                  globalDisabled={disabled}
                  onAction={handleAction}
                />
              ))}
            </div>

            {/* 右侧系统按钮组 */}
            <div className="flex items-center gap-1.5 ml-auto shrink-0">
              {allowCopy && value && (
                <CopyButton text={value} tooltip={'复制内容'} size="sm" className="h-7 w-7 p-1" />
              )}
              {showClear && value && !disabled && !readOnly && (
                <Button
                  type="button"
                  onClick={handleClear}
                  aria-label={'清空'}
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {displayError && (
        <p className="text-xs font-medium text-destructive px-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
          {displayError}
        </p>
      )}
    </div>
  );
});

TextInputArea.displayName = 'TextInputArea';

export default TextInputArea;
