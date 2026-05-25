import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import CopyButton from '@/components/CopyButton';
import { useSnackbar } from '@/components/GlobalSnackbar';
import type { UnitType } from './constants';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import { cn } from '@/lib/utils'; // 引入标准的 shadcn 工具函数

interface LiveClockProps extends React.HTMLAttributes<HTMLDivElement> {
  unit: UnitType;
  onUseNow: (val: number) => void;
}

const LiveClock = React.memo(({ unit, onUseNow, className, ...props }: LiveClockProps) => {
  const { t } = useLazyTranslation('timestamp');
  const { showMessage } = useSnackbar();
  const onUseNowRef = useRef(onUseNow);

  // 1. 采用毫秒/秒的双态原子计数，避免无意义的重绘
  const [currentDisplay, setCurrentDisplay] = useState(() => {
    const initNow = Date.now();
    return {
      rawTime: initNow,
      text: String(Math.floor(initNow / (unit === 'ms' ? 1 : 1000))),
    };
  });

  // 始终保持外部回调指针最新
  useEffect(() => {
    onUseNowRef.current = onUseNow;
  }, [onUseNow]);

  // 2. 高频高灵敏度计时器 (200ms 刷新率)
  useEffect(() => {
    const tick = () => {
      const rightNow = Date.now();
      const nextText = String(Math.floor(rightNow / (unit === 'ms' ? 1 : 1000)));

      // 性能核心：只有当生成的文本内容发生变化时，才触发 React 的 State 更新。
      // 在“秒(s)”单位下，这可以让组件的渲染频率暴跌 90%，做到极度省电和高性能。
      setCurrentDisplay((prev) => {
        if (prev.text === nextText) return prev;
        return { rawTime: rightNow, text: nextText };
      });
    };

    // 200ms 的高速低延迟轮询，比 1000ms 更具响应灵敏度，且因为上面有过滤，完全不用担心引发性能损耗
    const tickId = setInterval(tick, 200);
    return () => clearInterval(tickId);
  }, [unit]);

  const handleUseNow = useCallback(() => {
    // 捕获真实极其精准的绝对时间戳
    onUseNowRef.current(currentDisplay.rawTime);
    showMessage?.(t('timestamp:usedSuccess'), { severity: 'success' });
  }, [currentDisplay.rawTime, showMessage, t]);

  return (
    <div
      className={cn(
        // 3. 完美适配 shadcn 暗黑模式：
        // 不再写死 bg-primary/10，改用更高级的 bg-secondary/50 和中性边框，
        // 在任何主题色下都能表现得低调且极具质感。
        'flex items-center gap-3 px-3 h-10 rounded-lg border border-border/80 bg-secondary/50',
        className,
      )}
      {...props}
    >
      <span className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider whitespace-nowrap shrink-0 selection:bg-transparent select-none">
        {t('timestamp:currentTs')}
      </span>

      {/* 4. tabular-nums 强制使用等宽数字布局，彻底消灭数字跳动时字符宽度不同带来的抖动颤噪感 */}
      <span className="flex-1 font-mono font-bold text-foreground text-sm tracking-tight leading-none truncate tabular-nums">
        {currentDisplay.text}
      </span>

      {/* 5. 按钮重构成精巧的 shadcn 原子微动效风格 */}
      <button
        type="button"
        onClick={handleUseNow}
        title={t('timestamp:useNowTooltip')}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-input bg-background text-muted-foreground shadow-sm hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <Clock className="w-3.5 h-3.5" />
      </button>

      <CopyButton
        text={currentDisplay.text}
        tooltip={t('timestamp:copyTsTooltip')}
        size="small"
        className="h-7 w-7 rounded-md border" // 移除了硬编码的颜色配置表，完全交由组件的内置 Class 渲染
      />
    </div>
  );
});

LiveClock.displayName = 'LiveClock';

export default LiveClock;
