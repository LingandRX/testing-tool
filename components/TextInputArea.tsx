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
import {
  Box,
  Button,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  alpha,
  type SxProps,
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
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
  sx?: SxProps<Theme>;

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
  variant = 'text',
  onAction,
  size = 'small',
  compact,
}: ActionButtonProps) {
  const isBtnDisabled =
    typeof action.disabled === 'function' ? action.disabled(value) : action.disabled || !value;

  const typeStyles: Record<string, unknown> = {};

  if (action.type === 'primary') {
    if (variant !== 'contained') {
      typeStyles.bgcolor = 'primary.main';
      typeStyles.color = 'primary.contrastText';
      typeStyles['&:hover'] = { bgcolor: 'primary.dark' };
    }
  } else if (action.type === 'danger') {
    typeStyles.color = 'error.main';
    typeStyles['&:hover'] = {
      bgcolor: (theme: Theme) => alpha(theme.palette.error.main, 0.08),
    };
  } else {
    typeStyles.color = 'text.secondary';
    typeStyles['&:hover'] = {
      bgcolor: (theme: Theme) => alpha(theme.palette.grey[500], 0.1),
    };
  }

  return (
    <Button
      onClick={() => onAction(action)}
      disabled={isBtnDisabled || globalDisabled}
      size={size}
      variant={variant}
      startIcon={action.icon}
      sx={{
        fontWeight: 600,
        borderRadius: 2,
        ...typeStyles,
        ...(compact ? { fontSize: '0.75rem', px: 1.5, minWidth: 0 } : { fontSize: '0.8rem' }),
      }}
    >
      {action.label}
    </Button>
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
    placeholder = '请输入文本...',
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
  } = props;

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [error, setError] = useState<string>('');

  /** 通过 value prop 是否存在来判断是否为受控模式 */
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

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
      const msg = `最多输入 ${maxLength} 个字符`;
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
  }, [isControlled, onChange]);

  /** 复制当前内容到剪贴板 */
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      showMessage?.('复制成功', { severity: 'success' });
    } catch {
      setError('复制失败');
      showMessage?.('复制失败', { severity: 'error' });
    }
  }, [value, showMessage]);

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

  const hasTopBar = title || showCount || topActions.length > 0 || topExtra || allowCopy;

  return (
    <Box className={className} style={style} sx={containerSx}>
      {hasTopBar && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1,
            px: 0.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {title && (
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                {title}
              </Typography>
            )}
            {topExtra}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {allowCopy && value && (
              <Tooltip title="复制内容">
                <Button
                  onClick={handleCopy}
                  size="small"
                  startIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  复制
                </Button>
              </Tooltip>
            )}
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
              <Typography
                variant="caption"
                sx={{ color: 'text.disabled', fontVariantNumeric: 'tabular-nums', ml: 0.5 }}
              >
                {value.length}
                {maxLength ? ` / ${maxLength}` : ''}
              </Typography>
            )}
          </Box>
        </Box>
      )}

      <Box sx={{ position: 'relative' }}>
        <TextField
          inputRef={handleInputRef}
          multiline
          fullWidth
          minRows={autoResize ? minRows : undefined}
          maxRows={autoResize ? maxRows : undefined}
          rows={autoResize ? undefined : minRows}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          autoFocus={autoFocus}
          error={Boolean(error)}
          helperText={error || undefined}
          slotProps={{
            input: { readOnly },
            formHelperText: {
              sx: { mx: 1.5, fontWeight: 600, '&.Mui-error': { color: 'error.main' } },
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.paper',
              borderRadius: 3,
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              lineHeight: 1.6,
              transition: 'all 0.2s',
              '&:hover': { bgcolor: 'action.hover' },
              '&.Mui-focused': {
                bgcolor: 'background.paper',
                boxShadow: (theme) => `${alpha(theme.palette.primary.main, 0.08)} 0 0 0 3px`,
              },
              '&.Mui-error': {
                boxShadow: (theme) => `${alpha(theme.palette.error.main, 0.08)} 0 0 0 3px`,
              },
              '& textarea': {
                py: 1.5,
                px: 1.5,
                ...(showClear ? { pb: 4 } : {}),
              },
            },
            '& .MuiFormHelperText-root': {
              mx: 0,
              mt: 0.5,
            },
          }}
        />

        {showClear && value && !disabled && !readOnly && (
          <IconButton
            onClick={handleClear}
            size="small"
            title="清空"
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              color: 'text.disabled',
              '&:hover': {
                color: 'error.main',
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
              },
              zIndex: 1,
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>

      {bottomActions.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
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
        </Box>
      )}
    </Box>
  );
});

TextInputArea.displayName = 'TextInputArea';

export default TextInputArea;
