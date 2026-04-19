import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { copyToClipboard } from '@/utils/clipboard';

interface CopyButtonProps {
  text: string;
  tooltip?: string;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | string;
  style?: React.CSSProperties;
  showMessage?: (message: string, options?: { severity: 'success' | 'error' }) => void;
}

/**
 * 复制按钮组件
 * @param text 要复制的文本
 * @param tooltip 提示信息
 * @param size 按钮大小
 * @param color 按钮颜色
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

  const handleCopy = async () => {
    if (text) {
      const success = await copyToClipboard(text, showMessage);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } else {
      showMessage?.('无内容可复制', { severity: 'error' });
    }
  };

  return (
    <Tooltip title={tooltip}>
      <IconButton
        size={size}
        onClick={handleCopy}
        style={style}
        sx={{
          color: copied ? 'success.main' : color,
          bgcolor: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          '&:hover': {
            bgcolor: copied
              ? 'success.main'
              : typeof color === 'string' &&
                  !['primary', 'secondary', 'success', 'error', 'info', 'warning'].includes(color)
                ? color
                : `${color}.main`,
            color: '#fff',
          },
        }}
      >
        {copied ? (
          <CheckIcon fontSize={size === 'small' ? 'small' : 'medium'} />
        ) : (
          <ContentCopyIcon fontSize={size === 'small' ? 'small' : 'medium'} />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default CopyButton;
