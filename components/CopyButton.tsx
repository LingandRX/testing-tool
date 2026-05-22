import React, { useEffect, useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyTextToClipboard } from '@/utils/clipboard';
import type { SnackbarOptions } from '@/components/GlobalSnackbar';

/**
 * 复制按钮组件属性
 * @param text 要复制的文本
 * @param tooltip 提示信息
 * @param size 按钮大小
 * @param color 按钮颜色
 * @param style 自定义样式
 * @param showMessage 消息提示函数，用于显示复制成功或失败的消息
 */
interface CopyButtonProps {
  text: string;
  tooltip?: string;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | string;
  style?: React.CSSProperties;
  showMessage?: (message: string, options?: SnackbarOptions) => void;
}

/**
 * 复制按钮组件
 * @param text 要复制的文本
 * @param tooltip 提示信息
 * @param size 按钮大小
 * @param color 按钮颜色
 * @param style 自定义样式
 * @param showMessage 消息提示函数，用于显示复制成功或失败的消息
 * @returns 复制按钮组件
 */
export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  tooltip = '复制',
  size = 'small',
  color = 'primary',
  style,
  showMessage,
}) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = async () => {
    if (text) {
      const success = await copyTextToClipboard(text);
      if (success) {
        showMessage?.('复制成功', { severity: 'success' });
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), 1500);
      } else {
        showMessage?.('复制失败', { severity: 'error' });
      }
    } else {
      showMessage?.('无内容可复制', { severity: 'error' });
    }
  };

  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-10 w-10',
    large: 'h-12 w-12',
  };

  const iconSize = size === 'small' ? 14 : size === 'medium' ? 16 : 18;

  const colorClasses: Record<string, string> = {
    primary: 'text-primary hover:bg-primary/10',
    secondary: 'text-foreground hover:bg-muted',
    success: 'text-green-600 hover:bg-green-500/10',
    error: 'text-red-600 hover:bg-red-500/10',
    info: 'text-primary hover:bg-primary/10',
    warning: 'text-amber-600 hover:bg-amber-50',
  };

  const colorClass = colorClasses[color] || `text-[${color}] hover:bg-muted`;

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={tooltip}
      style={style}
      className={`${sizeClasses[size]} rounded-md flex items-center justify-center transition-all ${
        copied ? 'text-green-600 bg-green-50' : colorClass
      } bg-background shadow-sm hover:shadow-md`}
    >
      {copied ? (
        <Check style={{ width: iconSize, height: iconSize }} />
      ) : (
        <Copy style={{ width: iconSize, height: iconSize }} />
      )}
    </button>
  );
};

export default CopyButton;
