import { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorFallback } from '@/components/ErrorFallback';

interface Props {
  children: ReactNode;
  resetKey?: string | number;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class PageErrorBoundary extends Component<Props, State> {
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
        <ErrorFallback
          variant="page"
          title="该功能运行异常"
          description="该页面在加载或渲染时遇到了内部脚本错误。您可以尝试重试，或者通过导航菜单切换到其他工具。"
          error={this.state.error}
          actionLabel="重新尝试"
          onAction={this.handleRetry}
          showStack
        />
      );
    }

    return this.props.children;
  }
}

export { PageErrorBoundary };
export default PageErrorBoundary;
