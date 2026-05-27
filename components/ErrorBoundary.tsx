import { Component, ErrorInfo, ReactNode } from 'react';
import { withTranslation, type WithTranslation } from 'react-i18next';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props extends WithTranslation {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryBase extends Component<Props, State> {
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
    const { t } = this.props;
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center mt-16 mx-auto max-w-md">
          <div className="p-6 text-center rounded-xl border border-destructive/20 bg-destructive/5 shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-extrabold text-destructive mb-2">
              {t('errorBoundary.title')}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">{t('errorBoundary.description')}</p>
            {this.state.error && (
              <div className="mb-6 p-4 rounded-lg bg-zinc-950 dark:bg-zinc-900 text-left max-h-[200px] overflow-auto border border-border/40">
                <pre className="font-mono text-xs whitespace-pre-wrap break-all text-zinc-200 selection:bg-zinc-700">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}
            <Button
              variant="destructive"
              onClick={this.handleReset}
              className="rounded-lg font-bold shadow-sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('errorBoundary.refresh')}
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = withTranslation('common')(ErrorBoundaryBase);
export default ErrorBoundary;
