/**
 * 结果面板组件
 * 展示生成结果的状态和统计信息
 */

import { CheckCircle, AlertTriangle, XCircle, Clock, Database } from 'lucide-react';
import type { GenerateResult } from '@/types/testDataGenerator';

interface ResultPanelProps {
  result: GenerateResult | null;
}

export default function ResultPanel({ result }: ResultPanelProps) {
  if (!result) return null;

  const getStatusIcon = () => {
    if (result.success && (!result.warnings || result.warnings.length === 0)) {
      return <CheckCircle className="h-5 w-5 text-success" />;
    }
    if (result.success && result.warnings && result.warnings.length > 0) {
      return <AlertTriangle className="h-5 w-5 text-warning" />;
    }
    return <XCircle className="h-5 w-5 text-destructive" />;
  };

  const getStatusText = () => {
    if (result.success && (!result.warnings || result.warnings.length === 0)) {
      return '生成成功';
    }
    if (result.success && result.warnings && result.warnings.length > 0) {
      return '部分成功';
    }
    return '生成失败';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className="text-sm font-medium text-foreground">{getStatusText()}</span>
      </div>

      {result.stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
            <Database className="h-4 w-4 text-muted-foreground mb-1" />
            <span className="text-lg font-semibold text-foreground">
              {result.stats.total.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">总条数</span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
            <CheckCircle className="h-4 w-4 text-success mb-1" />
            <span className="text-lg font-semibold text-success">
              {result.stats.success.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">成功</span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
            <Clock className="h-4 w-4 text-muted-foreground mb-1" />
            <span className="text-lg font-semibold text-foreground">
              {(result.stats.duration / 1000).toFixed(2)}s
            </span>
            <span className="text-xs text-muted-foreground">耗时</span>
          </div>
        </div>
      )}

      {result.warnings && result.warnings.length > 0 && (
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium text-warning">警告</span>
          </div>
          <ul className="list-disc list-inside space-y-1">
            {result.warnings.slice(0, 5).map((warning, index) => (
              <li key={index} className="text-xs text-warning/80">
                {warning}
              </li>
            ))}
            {result.warnings.length > 5 && (
              <li className="text-xs text-warning/80">
                ... 还有 {result.warnings.length - 5} 条警告
              </li>
            )}
          </ul>
        </div>
      )}

      {result.error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{result.error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
