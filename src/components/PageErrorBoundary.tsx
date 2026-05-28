import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMessage } from '@/utils/chromeI18n';

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
        <div className="flex flex-col items-center justify-center flex-1 p-6 min-h-[300px] animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6 text-center rounded-xl border border-destructive/20 bg-destructive/5 max-w-md w-full shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>

            <h3 className="text-base font-semibold text-foreground mb-1.5">
              {getMessage('pageErrorBoundary_title')}
            </h3>
            <p className="text-xs text-muted-foreground mb-5">
              {getMessage('pageErrorBoundary_description')}
            </p>

            {this.state.error && (
              <div className="mb-5 p-3 rounded-lg bg-zinc-950 dark:bg-zinc-900 text-left max-h-40 overflow-y-auto border border-border/40">
                <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-all text-zinc-200 selection:bg-zinc-700">
                  {this.state.error.stack || this.state.error.toString()}
                </pre>
              </div>
            )}

            <Button
              variant="destructive"
              size="sm"
              onClick={this.handleRetry}
              className="font-medium shadow-sm"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              {getMessage('errorBoundary_retry')}
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { PageErrorBoundary };
export default PageErrorBoundary;
