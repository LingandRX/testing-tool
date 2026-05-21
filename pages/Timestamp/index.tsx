import { Clock } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import { ZONES } from '@/config/pageTheme';
import LiveClock from './LiveClock';
import ResultView from './ResultView';
import { useTimestampConverter } from './useTimestampConverter';
import { useLazyTranslation } from '@/utils/useLazyTranslation';

export default function Index() {
  const { t } = useLazyTranslation('timestamp');
  const {
    mode,
    tsInput,
    dtInput,
    unit,
    zone,
    result,
    error,
    setMode,
    setInput,
    setUnit,
    setZone,
    handleUseNow,
    convert,
  } = useTimestampConverter();

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <PageHeader
          title={t('timestamp:pageTitle')}
          subtitle={t('timestamp:pageSubtitle')}
          icon={<Clock />}
        />

        {/* 参考信息：分栏上方全宽单行参考条 */}
        <LiveClock unit={unit} onUseNow={handleUseNow} />

        {/* 桌面端 md+ 左右分栏；移动端单栏堆叠 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          {/* 左栏：转换工作台 */}
          <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
            {/* 模式切换 */}
            <SwitchButtonGroup
              value={mode}
              options={[
                { value: 'ts2dt', label: t('timestamp:tsToDate') },
                { value: 'dt2ts', label: t('timestamp:dateToTs') },
              ]}
              onChange={(newMode) => setMode(newMode)}
              size="small"
            />

            {/* 输入区 */}
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder={
                  mode === 'ts2dt' ? t('timestamp:placeholderTs') : t('timestamp:placeholderDate')
                }
                value={mode === 'ts2dt' ? tsInput : dtInput}
                onChange={(e) => setInput(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  error ? 'border-red-500' : 'border-gray-300'
                } bg-white text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

              {/* 单位+时区紧凑横排 */}
              <div className="flex flex-wrap gap-3 w-full">
                <SwitchButtonGroup
                  value={unit}
                  options={[
                    { value: 'ms', label: t('timestamp:unitMs') },
                    { value: 's', label: t('timestamp:unitS') },
                  ]}
                  onChange={(v) => setUnit(v as 'ms' | 's')}
                  sx={{ width: 'auto', mb: 0, flexShrink: 0 }}
                  size="small"
                />

                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value as typeof zone)}
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {ZONES.map((z) => (
                    <option key={z} value={z} className="text-sm font-semibold">
                      {z}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 立即转换 */}
            <button
              onClick={convert}
              className="block mx-auto mt-4 mb-1 max-w-[240px] w-full py-2.5 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
            >
              {t('timestamp:convertButton')}
            </button>
          </div>

          {/* 右栏：结果展示卡片 */}
          <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm h-full flex flex-col">
            <ResultView result={result} mode={mode} unit={unit} zone={zone} showEmptyPlaceholder />
          </div>
        </div>
      </div>
    </div>
  );
}
