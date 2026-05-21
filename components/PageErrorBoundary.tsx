import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        <div className="flex flex-col items-center justify-center flex-1 p-4 min-h-[200px]">
          <div className="p-6 text-center rounded-xl border border-red-200 bg-red-50 max-w-md w-full">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-red-600 mb-2">该页面加载失败</h3>
            <p className="text-sm text-gray-500 mb-4">
              页面在加载或渲染时遇到错误，您可以重试或切换到其他工具。
            </p>
            {this.state.error && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg text-left max-h-[160px] overflow-auto">
                <pre className="font-mono text-xs whitespace-pre-wrap break-all text-red-700">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}
            <Button
              variant="default"
              onClick={this.handleRetry}
              className="rounded-lg font-bold bg-red-600 hover:bg-red-700 text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              重试
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PageErrorBoundary;
