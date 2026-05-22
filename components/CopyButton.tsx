import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { copyTextToClipboard } from '@/utils/clipboard';
import { cn } from '@/lib/utils'; // 1. 必须使用 cn 工具函数
import { toast } from 'sonner'; // 2. 推荐使用 shadcn 默认的全局 toast

// 3. 继承原生按钮属性，允许外部自由扩展 className、variant 等
interface CopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  tooltip?: string;
  size?: 'small' | 'medium' | 'large';
  // 移除复杂的自定义颜色变体，交由 Tailwind 类名或 shadcn 的 variant 解决
  variant?: 'default' | 'secondary' | 'ghost' | 'outline';
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  tooltip = '复制',
  size = 'small',
  variant = 'ghost',
  className,
  ...props
}) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // 基础组件防冒泡，避免触发父级点击事件

    if (!text) {
      toast.error('无内容可复制');
      return;
    }

    const success = await copyTextToClipboard(text);
    if (success) {
      toast.success('复制成功');
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1500);
    } else {
      toast.error('复制失败');
    }
  };

  // 4. 将控制尺寸的类名标准化
  const sizeClasses = {
    small: 'h-8 w-8 text-xs',
    medium: 'h-10 w-10 text-sm',
    large: 'h-12 w-12 text-base',
  };

  // 5. 映射 shadcn 的底层通用 Variant 类名
  const variantClasses = {
    default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline:
      'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={tooltip}
      // 6. 使用 cn() 合并类名，并完美支持暗黑模式的语义化变量 (destructive/muted等)
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        sizeClasses[size],
        copied
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' // 兼顾暗黑模式的成功色
          : variantClasses[variant],
        className, // 允许外部直接传入 text-red-500 等覆盖样式
      )}
      {...props}
    >
      {copied ? (
        <Check className="h-[1.2em] w-[1.2em] animate-in fade-in zoom-in-75 duration-200" />
      ) : (
        <Copy className="h-[1.2em] w-[1.2em]" />
      )}
    </button>
  );
};

export default CopyButton;
