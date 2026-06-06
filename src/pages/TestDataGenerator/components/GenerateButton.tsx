/**
 * 生成按钮组件
 * 显示生成按钮、加载状态和进度条
 */

import { Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/utils/chromeI18n';
import type { GenerateProgress } from '@/types/testDataGenerator';

interface GenerateButtonProps {
  onClick: () => void;
  onCancel: () => void;
  isGenerating: boolean;
  progress: GenerateProgress | null;
  disabled?: boolean;
}

export default function GenerateButton({
  onClick,
  onCancel,
  isGenerating,
  progress,
  disabled,
}: GenerateButtonProps) {
  const { t } = useI18n('testDataGenerator');

  return (
    <div className="space-y-3">
      {isGenerating ? (
        <>
          <Button variant="destructive" onClick={onCancel} className="w-full h-11 gap-2">
            <Square className="h-5 w-5" />
            {t('testDataGenerator_cancel')}
          </Button>

          {/* 进度条 */}
          {progress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {t('testDataGenerator_progress', {
                    current: progress.generated.toLocaleString(),
                    total: progress.total.toLocaleString(),
                  })}
                </span>
                <span>{progress.progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
              {progress.estimatedTimeLeft !== undefined && (
                <p className="text-xs text-muted-foreground text-center">
                  {t('testDataGenerator_estimatedTime', {
                    time: Math.ceil(progress.estimatedTimeLeft / 1000),
                  })}
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <Button onClick={onClick} disabled={disabled} className="w-full h-11 gap-2">
          <Play className="h-5 w-5" />
          {t('testDataGenerator_generate')}
        </Button>
      )}
    </div>
  );
}
