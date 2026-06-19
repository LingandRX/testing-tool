import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { copyTextToClipboard } from '@/utils/clipboard';
import { Button, type ButtonProps } from '@/components/ui/button';
import { toast } from 'sonner';

interface CopyButtonProps extends Omit<ButtonProps, 'children' | 'onClick'> {
  text: string;
  tooltip?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  tooltip,
  variant = 'ghost',
  size = 'icon',
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
    e.stopPropagation();

    if (!text) {
      toast.error('无内容可复制');
      return;
    }

    const success = await copyTextToClipboard(text);
    if (success) {
      toast.success('已复制到剪贴板');
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1500);
    } else {
      toast.error('复制失败');
    }
  };

  return (
    <Button
      type="button"
      onClick={handleCopy}
      title={tooltip ?? '复制'}
      aria-label={tooltip ?? '复制'}
      variant={variant}
      size={size}
      className={className}
      {...props}
    >
      {copied ? (
        <Check className="h-[1.2em] w-[1.2em]" />
      ) : (
        <Copy className="h-[1.2em] w-[1.2em]" />
      )}
    </Button>
  );
};

export default CopyButton;
