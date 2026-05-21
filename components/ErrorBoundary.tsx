import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 错误边界组件：捕获子组件树中的 JavaScript 错误
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false, error: null });
    }
  }

  private handleReset = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="mt-16 mx-auto max-w-md">
          <div className="p-6 text-center rounded-xl border border-red-200 bg-red-50">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-extrabold text-red-600 mb-2">糟糕，出了点问题</h2>
            <p className="text-sm text-gray-500 mb-6">
              应用遇到了一些意外错误。您可以尝试刷新页面或重置应用。
            </p>
            {this.state.error && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left max-h-[200px] overflow-auto">
                <pre className="font-mono text-xs whitespace-pre-wrap break-all text-red-700">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}
            <Button
              variant="default"
              onClick={this.handleReset}
              className="rounded-lg font-bold bg-red-600 hover:bg-red-700 text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              刷新应用
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
