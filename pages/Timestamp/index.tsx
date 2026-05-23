import { Clock } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import { ZONES } from './constants';
import LiveClock from './LiveClock';
import ResultView from './ResultView';
import { useTimestampConverter } from './useTimestampConverter';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import { cn } from '@/lib/utils';

// 1. 引入标准的 shadcn/ui 原子表单组件（代替原生的原生 Input 和 Select）
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Index() {
  const { t } = useLazyTranslation('timestamp');

  // 2. 完美对接全新重构后的统一单源响应式 Hook
  const {
    mode,
    input,
    unit,
    zone,
    result,
    error,
    setMode,
    setInput,
    setUnit,
    setZone,
    handleUseNow,
  } = useTimestampConverter();

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
        {/* Header */}
        <PageHeader
          title={t('timestamp:pageTitle')}
          subtitle={t('timestamp:pageSubtitle')}
          icon={<Clock />}
        />

        {/* 动态参考信息时钟条 */}
        <LiveClock unit={unit} onUseNow={handleUseNow} />

        {/* 核心工作台网格：桌面端 md+ 左右等宽分栏；移动端单栏堆叠 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          {/* 左栏：转换工作台 */}
          <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-sm flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              {/* 模式选择切换组 */}
              <SwitchButtonGroup
                value={mode}
                options={[
                  { value: 'ts2dt', label: t('timestamp:tsToDate') },
                  { value: 'dt2ts', label: t('timestamp:dateToTs') },
                ]}
                onChange={(newMode) => setMode(newMode as 'ts2dt' | 'dt2ts')}
                size="small"
              />

              {/* 输入交互区 */}
              <div className="flex flex-col gap-1.5">
                {/*
                  3. 替换为标准的 shadcn <Input /> 组件：
                  享受原生高水准的 focus-visible 环形动画响应。
                */}
                <Input
                  type="text"
                  placeholder={
                    mode === 'ts2dt' ? t('timestamp:placeholderTs') : t('timestamp:placeholderDate')
                  }
                  value={input}
                  onChange={(e: { target: { value: string } }) => setInput(e.target.value)}
                  className={cn(
                    'font-mono font-semibold h-10 shadow-sm placeholder:text-muted-foreground/60 focus:bg-background transition-all',
                    error && 'border-destructive focus-visible:ring-destructive',
                  )}
                />

                {/* 错误自愈提示 */}
                {error && (
                  <p className="text-destructive text-xs font-medium px-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    {error}
                  </p>
                )}
              </div>

              {/* 核心配置群：单位切换 + 时区选择紧凑横排 */}
              <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full">
                {/* 时间精度单位选择 */}
                <SwitchButtonGroup
                  value={unit}
                  options={[
                    { value: 'ms', label: t('timestamp:unitMs') },
                    { value: 's', label: t('timestamp:unitS') },
                  ]}
                  onChange={(v) => setUnit(v as 'ms' | 's')}
                  size="small"
                  className="sm:w-auto shrink-0" // 窄屏下全宽，宽屏下自适应收缩
                />

                {/*
                  4. 降维打击：将原生 <select> 强行超进化为标准的 shadcn <Select>：
                  全操作系统的样式绝对一致，完美融合暗黑模式，悬浮弹窗自带微距磨砂玻璃阻尼动效。
                */}
                <Select value={zone} onValueChange={(v: string) => setZone(v as typeof zone)}>
                  <SelectTrigger className="flex-1 font-mono font-semibold h-9 shadow-sm bg-background">
                    <SelectValue placeholder="选择时区" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64 font-mono">
                    {ZONES.map((z) => (
                      <SelectItem
                        key={z}
                        value={z}
                        className="text-xs font-semibold focus:bg-accent cursor-pointer"
                      >
                        {z}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/*
              5. 彻底移除了原先丑陋的手动 convert 按钮！
              在响应式 Hook 的加持下，此处留白或由排版自然撑开，界面视觉极其干净。
            */}
          </div>

          {/* 右栏：结果实时流展示卡片 */}
          <div className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-sm h-full flex flex-col">
            <ResultView result={result} mode={mode} unit={unit} zone={zone} showEmptyPlaceholder />
          </div>
        </div>
      </div>
    </div>
  );
}
