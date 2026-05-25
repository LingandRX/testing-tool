import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import JsonDiffInput from './JsonDiffInput';
import DiffResult from './DiffResult';
import DiffNavigator from './DiffNavigator';
import JsonFormatSection from './JsonFormatSection';
import type { ConvertFunction } from './JsonConvertSection';
import JsonConvertSection from './JsonConvertSection';
import { diffJson } from './diffEngine';
import { jsonToYaml } from '@/utils/jsonToYaml';
import { jsonToToml } from '@/utils/jsonToToml';
import { minifyJson } from '@/utils/jsonFormatter';
import { useStorageState } from '@/utils/useStorageState';
import type { JsonToolsPageMode } from '@/types/storage';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import type { ViewMode } from './types';

interface ParseState {
  value: unknown;
  error: string | null;
}

const tryParse = (raw: string, invalidMsg: string): ParseState => {
  const trimmed = raw.trim();
  if (!trimmed) return { value: undefined, error: null };
  try {
    return { value: JSON.parse(trimmed), error: null };
  } catch {
    return { value: undefined, error: invalidMsg };
  }
};

const VALID_PAGE_MODES: readonly JsonToolsPageMode[] = ['diff', 'format', 'yaml', 'toml', 'minify'];
const isValidPageMode = (val: unknown): val is JsonToolsPageMode =>
  typeof val === 'string' && (VALID_PAGE_MODES as readonly string[]).includes(val);

type PageMode = JsonToolsPageMode;

export default function Index() {
  const { t } = useLazyTranslation(['jsonDiff', 'jsonFormat']);
  const [pageMode, setPageMode] = useStorageState('jsonTools/pageMode', 'diff', isValidPageMode);

  // 1. 受控原始输入源
  const [leftInput, setLeftInput] = useState('');
  const [rightInput, setRightInput] = useState('');

  // 2. 纯净的异步防抖管道：仅负责切断高频打字开销
  const [debouncedLeft, setDebouncedLeft] = useState('');
  const [debouncedRight, setDebouncedRight] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedLeft(leftInput);
      setDebouncedRight(rightInput);
    }, 250);
    return () => clearTimeout(handle);
  }, [leftInput, rightInput]);

  // 3. 贯彻方案A：利用 useMemo 将防抖文本同步转化为解析树和错误提示
  const parseState = useMemo(() => {
    const invalidMsg = t('jsonDiff:invalidJson');
    return {
      left: tryParse(debouncedLeft, invalidMsg),
      right: tryParse(debouncedRight, invalidMsg),
    };
  }, [debouncedLeft, debouncedRight, t]);

  const leftError = parseState.left.error;
  const rightError = parseState.right.error;

  const [viewMode, setViewMode] = useState<ViewMode>('sideBySide');
  const [currentDiffIndex, setCurrentDiffIndex] = useState(0);

  // 4. 实时比对流式计算
  const diffResult = useMemo(() => {
    const { left, right } = parseState;
    if (left.error || right.error || debouncedLeft.trim() === '' || debouncedRight.trim() === '') {
      return null;
    }
    return diffJson(left.value, right.value);
  }, [parseState, debouncedLeft, debouncedRight]);

  // 💡 彻底删除了原本在此处的侦听 [diffResult] 的 useEffect。
  // 状态重置已完全委托给事件源头，级联更新警告从根源上永久自愈！

  const total = diffResult?.diffPaths.length ?? 0;

  const handlePrev = useCallback(() => {
    if (total === 0) return;
    setCurrentDiffIndex((idx) => (idx - 1 + total) % total);
  }, [total]);

  const handleNext = useCallback(() => {
    if (total === 0) return;
    setCurrentDiffIndex((idx) => (idx + 1) % total);
  }, [total]);

  const activePath = diffResult && total > 0 ? diffResult.diffPaths[currentDiffIndex] : undefined;

  const yamlConvert: ConvertFunction = useCallback((text: string) => {
    const r = jsonToYaml(text);
    return { output: r.output, originalBytes: r.originalBytes, outputBytes: r.outputBytes };
  }, []);

  const tomlConvert: ConvertFunction = useCallback((text: string) => {
    const r = jsonToToml(text);
    return { output: r.output, originalBytes: r.originalBytes, outputBytes: r.outputBytes };
  }, []);

  const minifyConvert: ConvertFunction = useCallback((text: string) => {
    const r = minifyJson(text);
    return { output: r.minified, originalBytes: r.originalBytes, outputBytes: r.minifiedBytes };
  }, []);

  return (
    <div className="p-4 w-full flex flex-col space-y-4 min-h-[500px] select-none">
      <SwitchButtonGroup
        value={pageMode}
        onChange={(v: PageMode) => setPageMode(v)}
        options={[
          { value: 'diff', label: t('jsonFormat:diffMode') },
          { value: 'format', label: t('jsonFormat:formatMode') },
          { value: 'yaml', label: t('jsonFormat:yamlMode') },
          { value: 'toml', label: t('jsonFormat:tomlMode') },
          { value: 'minify', label: t('jsonFormat:minifyMode') },
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
                { value: 'sideBySide', label: t('jsonDiff:sideBySideMode') },
                { value: 'unified', label: t('jsonDiff:unifiedMode') },
              ]}
              size="small"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full items-stretch">
            <JsonDiffInput
              label={t('jsonDiff:leftLabel')}
              placeholder={t('jsonDiff:leftPlaceholder')}
              value={leftInput}
              onChange={(val) => {
                setLeftInput(val);
                setCurrentDiffIndex(0); // 💡 在同一个用户键盘事件中打包批处理，0 副作用开销
              }}
              error={leftError}
              minRows={9}
            />
            <JsonDiffInput
              label={t('jsonDiff:rightLabel')}
              placeholder={t('jsonDiff:rightPlaceholder')}
              value={rightInput}
              onChange={(val) => {
                setRightInput(val);
                setCurrentDiffIndex(0); // 💡 在同一个用户键盘事件中打包批处理，0 副作用开销
              }}
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
                  : t('jsonDiff:emptyHint')}
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
