import JsonDiffInput from './JsonDiffInput';
import JsonDiffPanel from './JsonDiffPanel';
import CompareActionBar from './CompareActionBar';
import DiffResult from './DiffResult';
import DiffNavigator from './DiffNavigator';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import EmptyPlaceholder from '@/components/EmptyPlaceholder';
import type { UseJsonToolsReturn } from '../useJsonTools';
import type { ViewMode } from '../types';

interface DiffWorkspaceProps {
  tools: UseJsonToolsReturn;
}

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'sideBySide', label: '并排' },
  { value: 'unified', label: '统一' },
];

export default function DiffWorkspace({ tools }: DiffWorkspaceProps) {
  const {
    isWide,
    viewMode,
    setViewMode,
    leftInput,
    rightInput,
    setLeftInput,
    setRightInput,
    leftError,
    rightError,
    activeResult,
    total,
    currentDiffIndex,
    handlePrev,
    handleNext,
    activePath,
    hasCompared,
    collapsedA,
    collapsedB,
    toggleCollapseA,
    toggleCollapseB,
    canCompare,
    handleCompare,
    previewA,
    previewB,
  } = tools;

  const viewToggle = (
    <div className="flex h-10 items-center justify-between rounded-xl border border-border/60 bg-secondary/40 px-1.5">
      <SwitchButtonGroup
        value={viewMode}
        onChange={(v: ViewMode) => setViewMode(v)}
        options={VIEW_OPTIONS}
        size="small"
      />
    </div>
  );

  if (isWide) {
    return (
      <div className="flex flex-1 min-h-0 flex-col space-y-4">
        {viewToggle}

        <div className="flex w-full flex-col items-stretch gap-4 md:flex-row shrink-0">
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

        {activeResult ? (
          <div className="flex min-h-0 flex-1 flex-col space-y-3.5 pt-1">
            <div className="flex w-full justify-center shrink-0">
              <DiffNavigator
                total={total}
                currentIndex={currentDiffIndex}
                onPrev={handlePrev}
                onNext={handleNext}
              />
            </div>
            <DiffResult result={activeResult} viewMode={viewMode} activePath={activePath} fill />
          </div>
        ) : (
          <EmptyPlaceholder className="min-h-[140px] flex-1" messageClassName="max-w-[260px]">
            {leftError || rightError
              ? '请修正上方 JSON 的语法错误以开启实时流式比对'
              : '输入两侧 JSON 后点击比较'}
          </EmptyPlaceholder>
        )}
      </div>
    );
  }

  const resultsVisible = collapsedA && collapsedB;

  const handleShowResults = () => {
    if (!collapsedA) toggleCollapseA();
    if (!collapsedB) toggleCollapseB();
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-3">
      <JsonDiffPanel
        title="数据 A（原始）"
        placeholder="输入原始 JSON..."
        value={leftInput}
        onChange={setLeftInput}
        error={leftError}
        collapsed={collapsedA}
        onToggleCollapse={toggleCollapseA}
        preview={previewA}
      />
      <CompareActionBar
        canCompare={canCompare}
        onCompare={handleCompare}
        hasCompared={hasCompared}
        total={total}
        currentIndex={currentDiffIndex}
        onPrev={handlePrev}
        onNext={handleNext}
        resultsVisible={resultsVisible}
        onShowResults={handleShowResults}
      />
      <JsonDiffPanel
        title="数据 B（目标）"
        placeholder="输入目标 JSON..."
        value={rightInput}
        onChange={setRightInput}
        error={rightError}
        collapsed={collapsedB}
        onToggleCollapse={toggleCollapseB}
        preview={previewB}
      />

      {activeResult && resultsVisible ? (
        <div className="flex min-h-0 flex-1">
          <DiffResult result={activeResult} viewMode={viewMode} activePath={activePath} fill />
        </div>
      ) : null}
    </div>
  );
}
