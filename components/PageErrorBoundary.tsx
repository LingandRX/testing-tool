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
 * 完美适配 shadcn/ui 语义化主题与暗黑模式
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
        <div className="flex flex-col items-center justify-center flex-1 p-6 min-h-[300px] animate-in fade-in zoom-in-95 duration-200">
          {/*
            1. 适配暗黑模式的容器设计：
            不再使用 border-red-200 / bg-red-50，改用标准的 border-destructive/20 和 bg-destructive/5，
            并在黑夜模式下会自动转为深红底色，绝不刺眼。
          */}
          <div className="p-6 text-center rounded-xl border border-destructive/20 bg-destructive/5 max-w-md w-full shadow-sm">
            {/* 2. 状态符号改用标准的 text-destructive 语义色 */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>

            <h3 className="text-base font-semibold text-foreground mb-1.5">该功能运行异常</h3>
            <p className="text-xs text-muted-foreground mb-5">
              该页面在加载或渲染时遇到了内部脚本错误。您可以尝试重试，或者通过导航菜单切换到其他工具。
            </p>

            {/* 3. 错误日志展示：使用与 shadcn 贴合的深色代码块包裹 */}
            {this.state.error && (
              <div className="mb-5 p-3 rounded-lg bg-zinc-950 dark:bg-zinc-900 text-left max-h-40 overflow-y-auto border border-border/40">
                <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-all text-zinc-200 selection:bg-zinc-700">
                  {this.state.error.stack || this.state.error.toString()}
                </pre>
              </div>
            )}

            {/*
              4. 严谨调用 shadcn 原子 Button：
              去掉全部手动指定的红底白字类名，直接启用 variant="destructive"。
              它会自动处理 hover 颜色变化、暗黑模式切换以及无障碍高亮边框。
            */}
            <Button
              variant="destructive"
              size="sm"
              onClick={this.handleRetry}
              className="font-medium shadow-sm"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              重新尝试
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PageErrorBoundary;
