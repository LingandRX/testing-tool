import JsonDiffInput from './components/JsonDiffInput';
import DiffResult from './components/DiffResult';
import DiffNavigator from './components/DiffNavigator';
import JsonFormatSection from './components/JsonFormatSection';
import JsonConvertSection from './components/JsonConvertSection';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import EmptyPlaceholder from '@/components/EmptyPlaceholder';
import { useJsonTools } from './useJsonTools';
import type { JsonToolsPageMode } from '@/types/storage';
import type { ViewMode } from './types';

type PageMode = JsonToolsPageMode;

export default function Index() {
  const {
    pageMode,
    setPageMode,
    leftInput,
    rightInput,
    setLeftInput,
    setRightInput,
    leftError,
    rightError,
    viewMode,
    setViewMode,
    diffResult,
    total,
    currentDiffIndex,
    handlePrev,
    handleNext,
    activePath,
    yamlConvert,
    tomlConvert,
    minifyConvert,
  } = useJsonTools();

  return (
    <div className="p-4 w-full flex flex-col space-y-4 min-h-[500px] select-none">
      <SwitchButtonGroup
        value={pageMode}
        onChange={(v: PageMode) => setPageMode(v)}
        options={[
          { value: 'diff', label: '差异比较' },
          { value: 'format', label: '格式化' },
          { value: 'yaml', label: 'YAML' },
          { value: 'toml', label: 'TOML' },
          { value: 'minify', label: '压缩' },
        ]}
        size="small"
        className="w-full sm:w-auto"
      />

      {pageMode === 'diff' ? (
        <div className="flex flex-col space-y-4">
          <div className="flex h-10 items-center justify-between px-1.5 bg-secondary/40 rounded-xl border border-border/60">
            <SwitchButtonGroup
              value={viewMode}
              onChange={(v: ViewMode) => setViewMode(v)}
              options={[
                { value: 'sideBySide', label: '并排' },
                { value: 'unified', label: '统一' },
              ]}
              size="small"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full items-stretch">
            <JsonDiffInput
              label="原始 JSON"
              placeholder="输入原始 JSON..."
              value={leftInput}
              onChange={setLeftInput}
              error={leftError}
              minRows={9}
            />
            <JsonDiffInput
              label="目标 JSON"
              placeholder="输入目标 JSON..."
              value={rightInput}
              onChange={setRightInput}
              error={rightError}
              minRows={9}
            />
          </div>

          {diffResult ? (
            <div className="flex flex-col space-y-3.5 w-full pt-1">
              <div className="flex justify-center w-full">
                <DiffNavigator
                  total={total}
                  currentIndex={currentDiffIndex}
                  onPrev={handlePrev}
                  onNext={handleNext}
                />
              </div>
              <DiffResult result={diffResult} viewMode={viewMode} activePath={activePath} />
            </div>
          ) : (
            <EmptyPlaceholder className="min-h-[140px]" messageClassName="max-w-[260px]">
              {leftError || rightError
                ? '请修正上方 JSON 的语法错误以开启实时流式比对'
                : '输入两侧 JSON 后点击比较'}
            </EmptyPlaceholder>
          )}
        </div>
      ) : pageMode === 'format' ? (
        <JsonFormatSection />
      ) : pageMode === 'yaml' ? (
        <JsonConvertSection mode="yaml" convertFunction={yamlConvert} />
      ) : pageMode === 'toml' ? (
        <JsonConvertSection mode="toml" convertFunction={tomlConvert} />
      ) : (
        <JsonConvertSection mode="minify" convertFunction={minifyConvert} />
      )}
    </div>
  );
}
