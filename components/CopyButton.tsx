import React, { useState, useCallback, FC, ReactNode, useEffect } from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert, { AlertColor } from '@mui/material/Alert';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

type CopyStatus = 'idle' | 'copying' | 'success' | 'error';

interface CopyButtonProps extends Omit<ButtonProps, 'onClick' | 'variant'> {
  textToCopy: string | number;
  buttonText?: ReactNode;
  successMessage?: string;
  errorMessage?: string;
  variant?: ButtonProps['variant'];
}

const CopyButton: FC<CopyButtonProps> = ({
  textToCopy,
  buttonText = '复制',
  successMessage = '复制成功！',
  errorMessage = '复制失败，请手动复制。',
  variant = 'contained',
  ...buttonProps
}) => {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarContent, setSnackbarContent] = useState<{
    message: string;
    severity: AlertColor;
  } | null>(null);

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      const timer = setTimeout(() => setStatus('idle'), 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [status]);

  const performCopy = useCallback(async () => {
    if (!textToCopy) {
      console.warn('没有提供要复制的文本');
      return false;
    }
    const safeText = String(textToCopy);
    try {
      await navigator.clipboard.writeText(safeText);
      return true;
    } catch (err) {
      console.error('使用 Clipboard API 复制失败:', err);
      return false;
    }
  }, [textToCopy]);

  const handleClick = useCallback(async () => {
    if (status !== 'idle') return;

    setStatus('copying');
    let isSuccess = false;
    try {
      [isSuccess] = await Promise.all([
        performCopy(),
        new Promise((resolve) => setTimeout(resolve, 300)),
      ]);
    } catch (error) {
      console.error('复制时出错:', error);
      isSuccess = false;
    } finally {
      const newStatus = isSuccess ? 'success' : 'error';
      setStatus(newStatus);
      setSnackbarContent({
        message: isSuccess ? successMessage : errorMessage,
        severity: newStatus,
      });
      setOpenSnackbar(true);
    }
  }, [performCopy, status, successMessage, errorMessage]);

  const handleCloseSnackbar = (_event?: Event | React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  const renderButtonIcon = () => {
    if (status === 'success') {
      return <CheckIcon sx={{ mr: 1 }} fontSize="small" />;
    }
    return <ContentCopyIcon sx={{ mr: 1 }} fontSize="small" />;
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={status !== 'idle'}
        variant={variant}
        {...buttonProps}
        sx={{
          ...buttonProps.sx,
          transition: 'background-color 0.3s',
          ...(status === 'success' && {
            bgcolor: 'success.main',
            '&:hover': {
              bgcolor: 'success.dark',
            },
          }),
        }}
      >
        {renderButtonIcon()}
        {buttonText}
      </Button>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {snackbarContent ? (
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbarContent.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbarContent.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
};

export default CopyButton;
