import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Props {
  children: ReactNode;
  resetKey?: string | number;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 页面级错误边界组件：捕获子组件树中的 JavaScript 错误
 * 与全局 ErrorBoundary 的区别：使用轻量内嵌卡片 UI，提供重试按钮
 */
export class PageErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in page:', error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            p: 3,
            minHeight: 200,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              textAlign: 'center',
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'error.light',
              bgcolor: 'rgba(211, 47, 47, 0.04)',
              maxWidth: 400,
              width: '100%',
            }}
          >
            <ErrorOutlineIcon color="error" sx={{ fontSize: 48, mb: 1.5 }} />
            <Typography variant="h6" fontWeight={700} gutterBottom color="error.main">
              该页面加载失败
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              页面在加载或渲染时遇到错误，您可以重试或切换到其他工具。
            </Typography>
            {this.state.error && (
              <Box
                sx={{
                  mb: 2,
                  p: 1.5,
                  bgcolor: (theme: Theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.100',
                  borderRadius: 2,
                  textAlign: 'left',
                  maxHeight: '160px',
                  overflow: 'auto',
                }}
              >
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    color: 'error.dark',
                  }}
                >
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}
            <Button
              variant="contained"
              color="error"
              startIcon={<RefreshIcon />}
              onClick={this.handleRetry}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              重试
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default PageErrorBoundary;
