/**
 * 结果面板组件
 * 展示生成结果的状态和统计信息
 */

import { CheckCircle, AlertTriangle, XCircle, Clock, Database } from 'lucide-react';
import { useI18n } from '@/utils/chromeI18n';
import type { GenerateResult } from '@/types/testDataGenerator';

interface ResultPanelProps {
  result: GenerateResult | null;
}

export default function ResultPanel({ result }: ResultPanelProps) {
  const { t } = useI18n('testDataGenerator');

  if (!result) return null;

  const getStatusIcon = () => {
    if (result.success && (!result.warnings || result.warnings.length === 0)) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (result.success && result.warnings && result.warnings.length > 0) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
    return <XCircle className="h-5 w-5 text-destructive" />;
  };

  const getStatusText = () => {
    if (result.success && (!result.warnings || result.warnings.length === 0)) {
      return t('testDataGenerator_success');
    }
    if (result.success && result.warnings && result.warnings.length > 0) {
      return t('testDataGenerator_partialSuccess');
    }
    return t('testDataGenerator_failed');
  };

  return (
    <div className="space-y-3">
      {/* 状态标题 */}
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className="text-sm font-medium text-foreground">{getStatusText()}</span>
      </div>

      {/* 统计信息 */}
      {result.stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
            <Database className="h-4 w-4 text-muted-foreground mb-1" />
            <span className="text-lg font-semibold text-foreground">
              {result.stats.total.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">
              {t('testDataGenerator_totalCount')}
            </span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
            <CheckCircle className="h-4 w-4 text-green-500 mb-1" />
            <span className="text-lg font-semibold text-green-500">
              {result.stats.success.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">
              {t('testDataGenerator_successCount')}
            </span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
            <Clock className="h-4 w-4 text-muted-foreground mb-1" />
            <span className="text-lg font-semibold text-foreground">
              {(result.stats.duration / 1000).toFixed(2)}s
            </span>
            <span className="text-xs text-muted-foreground">{t('testDataGenerator_duration')}</span>
          </div>
        </div>
      )}

      {/* 警告信息 */}
      {result.warnings && result.warnings.length > 0 && (
        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-500">
              {t('testDataGenerator_warnings')}
            </span>
          </div>
          <ul className="list-disc list-inside space-y-1">
            {result.warnings.slice(0, 5).map((warning, index) => (
              <li key={index} className="text-xs text-yellow-500/80">
                {warning}
              </li>
            ))}
            {result.warnings.length > 5 && (
              <li className="text-xs text-yellow-500/80">
                ... {t('testDataGenerator_moreWarnings', { count: result.warnings.length - 5 })}
              </li>
            )}
          </ul>
        </div>
      )}

      {/* 错误信息 */}
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
