import JsonDiffInput from './components/JsonDiffInput';
import DiffResult from './components/DiffResult';
import DiffNavigator from './components/DiffNavigator';
import JsonFormatSection from './components/JsonFormatSection';
import JsonConvertSection from './components/JsonConvertSection';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';
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
              label={'原始 JSON'}
              placeholder={'输入原始 JSON...'}
              value={leftInput}
              onChange={setLeftInput}
              error={leftError}
              minRows={9}
            />
            <JsonDiffInput
              label={'目标 JSON'}
              placeholder={'输入目标 JSON...'}
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
            <div className="p-8 rounded-xl bg-muted/30 border border-dashed border-border/80 text-center flex flex-col items-center justify-center min-h-[140px]">
              <p className="text-xs font-semibold text-muted-foreground/80 tracking-wide max-w-[260px] leading-relaxed">
                {leftError || rightError
                  ? '请修正上方 JSON 的语法错误以开启实时流式比对'
                  : '输入两侧 JSON 后点击比较'}
              </p>
            </div>
          )}
        </div>
      ) : pageMode === 'format' ? (
        <JsonFormatSection />
      ) : pageMode === 'yaml' ? (
        <JsonConvertSection translationPrefix="yaml" convertFunction={yamlConvert} />
      ) : pageMode === 'toml' ? (
        <JsonConvertSection translationPrefix="toml" convertFunction={tomlConvert} />
      ) : (
        <JsonConvertSection translationPrefix="minify" convertFunction={minifyConvert} />
      )}
    </div>
  );
}
