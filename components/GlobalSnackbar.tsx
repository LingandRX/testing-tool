import { useState } from 'react';
import { Snackbar, Alert, type SxProps, type Theme, alpha } from '@mui/material';

export type SnackbarSeverity = 'success' | 'info' | 'warning' | 'error';

export interface GlobalSnackbarProps {
  /** 消息内容 */
  message: string;
  /** 是否显示 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 消息级别：影响颜色 */
  severity?: SnackbarSeverity;
  /** 自动隐藏时间，毫秒，0 不自动关闭 */
  autoHideDuration?: number;
  /** 弹出位置 */
  anchorOrigin?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  /** 是否使用 Alert 包裹（false 则使用原生 Snackbar message） */
  showAlert?: boolean;
  /** Alert 是否隐藏图标 */
  hideIcon?: boolean;
  /** 自定义样式，透传给 Snackbar */
  sx?: SxProps<Theme>;
  /** 自定义样式，透传给 Alert（仅当 showAlert=true 时生效） */
  alertSx?: SxProps<Theme>;
}

export interface SnackbarOptions {
  severity?: SnackbarSeverity;
  autoHideDuration?: number;
  hideIcon?: boolean;
  showAlert?: boolean;
}

export interface UseSnackbarResult {
  snackbarProps: GlobalSnackbarProps;
  showMessage: (message: string, options?: SnackbarOptions) => void;
  closeMessage: () => void;
}

const defaultProps: Required<
  Pick<
    GlobalSnackbarProps,
    'severity' | 'autoHideDuration' | 'anchorOrigin' | 'showAlert' | 'hideIcon'
  >
> = {
  severity: 'info',
  autoHideDuration: 2000,
  anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
  showAlert: true,
  hideIcon: false,
};

export function GlobalSnackbar({
  message,
  open,
  onClose,
  severity = defaultProps.severity,
  autoHideDuration = defaultProps.autoHideDuration,
  anchorOrigin = defaultProps.anchorOrigin,
  showAlert = defaultProps.showAlert,
  hideIcon = defaultProps.hideIcon,
  sx,
  alertSx,
}: GlobalSnackbarProps) {
  // 共享的固定定位样式
  const fixedSx: SxProps<Theme> = {
    position: 'fixed',
    bottom: '24px !important', // 固定在视口底部
    left: '50% !important',
    transform: 'translateX(-50%) !important',
    zIndex: (theme) => theme.zIndex.tooltip + 100,
    maxWidth: '90%',
    width: 'max-content',
  };

  if (showAlert) {
    return (
      <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={onClose}
        anchorOrigin={anchorOrigin}
        disableWindowBlurListener
        sx={[fixedSx, ...(Array.isArray(sx) ? sx : [sx])]}
      >
        <Alert
          severity={severity}
          variant="filled"
          icon={hideIcon ? false : undefined}
          sx={[
            { 
              borderRadius: '50px',
              px: 2.5,
              py: 0.2,
              minWidth: '140px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: '0.02em',
              backgroundImage: 'none',
              boxShadow: (theme: Theme) => `0 12px 32px ${alpha(theme.palette[severity].main, 0.35)}`,
              
              '& .MuiAlert-icon': {
                mr: 0.5,
                fontSize: '1.1rem',
                color: '#fff'
              },
              '& .MuiAlert-message': {
                color: '#fff',
                padding: '6px 0',
                textAlign: 'center'
              }
            },
            ...(Array.isArray(alertSx) ? alertSx : [alertSx]),
          ]}
        >
          {message}
        </Alert>
      </Snackbar>
    );
  }

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      message={message}
      sx={[fixedSx, ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );
}

export function useSnackbar(initialOptions?: SnackbarOptions): UseSnackbarResult {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [options, setOptions] = useState<SnackbarOptions>(initialOptions || {});

  const showMessage = (newMessage: string, newOptions: SnackbarOptions = {}) => {
    setMessage(newMessage);
    setOptions({ ...initialOptions, ...newOptions });
    setOpen(true);
  };

  const closeMessage = () => {
    setOpen(false);
  };

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    closeMessage();
  };

  const snackbarProps: GlobalSnackbarProps = {
    message,
    open,
    onClose: handleClose,
    severity: options.severity,
    autoHideDuration: options.autoHideDuration,
    hideIcon: options.hideIcon,
  };

  return {
    snackbarProps,
    showMessage,
    closeMessage,
  };
}

export default GlobalSnackbar;
