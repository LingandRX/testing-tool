/**
 * 生成按钮组件
 * 显示生成按钮、加载状态和进度条
 */

import { Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  return (
    <div className="space-y-3">
      {isGenerating ? (
        <>
          <Button variant="destructive" onClick={onCancel} className="w-full h-11 gap-2">
            <Square className="h-5 w-5" />
            {'取消'}
          </Button>

          {/* 进度条 */}
          {progress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{'已生成 {{current}} / {{total}} 条'}</span>
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
                  {'预计剩余 {{time}} 秒'}
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <Button onClick={onClick} disabled={disabled} className="w-full h-11 gap-2">
          <Play className="h-5 w-5" />
          {'生成数据'}
        </Button>
      )}
    </div>
  );
}
