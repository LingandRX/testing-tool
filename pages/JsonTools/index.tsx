import { useEffect, useMemo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { GitCompareArrows, Braces, ArrowRightLeft, Minimize2 } from 'lucide-react';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import PageHeader from '@/components/PageHeader';
import JsonDiffInput from './JsonDiffInput';
import DiffResult from './DiffResult';
import DiffNavigator from './DiffNavigator';
import JsonFormatSection from './JsonFormatSection';
import JsonConvertSection from './JsonConvertSection';
import type { ConvertFunction } from './JsonConvertSection';
import { diffJson } from './diffEngine';
import type { DiffResult as DiffResultType, ViewMode } from './types';
import { jsonToYaml } from '@/utils/jsonToYaml';
import { jsonToToml } from '@/utils/jsonToToml';
import { minifyJson } from '@/utils/jsonFormatter';
import { useStorageState } from '@/utils/useStorageState';
import type { JsonToolsPageMode } from '@/types/storage';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';

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

/** 页面模式 */
const VALID_PAGE_MODES: readonly JsonToolsPageMode[] = ['diff', 'format', 'yaml', 'toml', 'minify'];

const isValidPageMode = (val: unknown): val is JsonToolsPageMode =>
  typeof val === 'string' && (VALID_PAGE_MODES as readonly string[]).includes(val);

type PageMode = JsonToolsPageMode;

export default function Index() {
  const { t } = useLazyTranslation(['jsonDiff', 'jsonFormat']);
  const [pageMode, setPageMode] = useStorageState('jsonTools/pageMode', 'diff', isValidPageMode);
  const [leftInput, setLeftInput] = useState('');
  const [rightInput, setRightInput] = useState('');
  const [leftError, setLeftError] = useState<string | null>(null);
  const [rightError, setRightError] = useState<string | null>(null);
  const [diffResult, setDiffResult] = useState<DiffResultType | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('sideBySide');
  const [currentDiffIndex, setCurrentDiffIndex] = useState(0);

  // 防抖校验输入
  useEffect(() => {
    const handle = setTimeout(() => {
      const invalid = t('jsonDiff:invalidJson');
      setLeftError(tryParse(leftInput, invalid).error);
      setRightError(tryParse(rightInput, invalid).error);
    }, 300);
    return () => clearTimeout(handle);
  }, [leftInput, rightInput, t]);

  const canCompare = useMemo(() => {
    return leftInput.trim() !== '' && rightInput.trim() !== '' && !leftError && !rightError;
  }, [leftInput, rightInput, leftError, rightError]);

  const handleCompare = () => {
    const invalid = t('jsonDiff:invalidJson');
    const left = tryParse(leftInput, invalid);
    const right = tryParse(rightInput, invalid);
    setLeftError(left.error);
    setRightError(right.error);
    if (left.error || right.error) {
      setDiffResult(null);
      return;
    }
    const result = diffJson(left.value, right.value);
    setDiffResult(result);
    setCurrentDiffIndex(0);
  };

  const handleClear = () => {
    setLeftInput('');
    setRightInput('');
    setLeftError(null);
    setRightError(null);
    setDiffResult(null);
    setCurrentDiffIndex(0);
  };

  const total = diffResult?.diffPaths.length ?? 0;

  const handlePrev = () => {
    if (total === 0) return;
    setCurrentDiffIndex((idx) => (idx - 1 + total) % total);
  };

  const handleNext = () => {
    if (total === 0) return;
    setCurrentDiffIndex((idx) => (idx + 1) % total);
  };

  const activePath = diffResult && total > 0 ? diffResult.diffPaths[currentDiffIndex] : undefined;

  /** 页面模式对应的标题和副标题翻译键 */
  const modeTitles: Record<PageMode, { title: string; subtitle: string }> = {
    diff: { title: 'jsonDiff:pageTitle', subtitle: 'jsonDiff:pageSubtitle' },
    format: { title: 'jsonFormat:formatTitle', subtitle: 'jsonFormat:formatSubtitle' },
    yaml: { title: 'jsonFormat:yamlTitle', subtitle: 'jsonFormat:yamlSubtitle' },
    toml: { title: 'jsonFormat:tomlTitle', subtitle: 'jsonFormat:tomlSubtitle' },
    minify: { title: 'jsonFormat:minifyTitle', subtitle: 'jsonFormat:minifySubtitle' },
  };

  const modeIcon: Record<PageMode, React.ReactNode> = {
    diff: <GitCompareArrows className="h-5 w-5" />,
    format: <Braces className="h-5 w-5" />,
    yaml: <ArrowRightLeft className="h-5 w-5" />,
    toml: <ArrowRightLeft className="h-5 w-5" />,
    minify: <Minimize2 className="h-5 w-5" />,
  };

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
    <div>
      <div className="p-2">
        <PageHeader
          title={t(modeTitles[pageMode].title)}
          subtitle={t(modeTitles[pageMode].subtitle)}
          icon={modeIcon[pageMode]}
          iconColor="#3b82f6"
        />

        <div className="flex flex-col gap-6">
          {/* 页面模式切换器 */}
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
          />

          {pageMode === 'diff' ? (
            <>
              {/* 工具栏 */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                <SwitchButtonGroup
                  value={viewMode}
                  onChange={(v: ViewMode) => setViewMode(v)}
                  options={[
                    { value: 'sideBySide', label: t('jsonDiff:sideBySideMode') },
                    { value: 'unified', label: t('jsonDiff:unifiedMode') },
                  ]}
                  size="small"
                />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleClear} className="rounded-lg">
                    {t('jsonDiff:clearButton')}
                  </Button>
                  <Button
                    variant="default"
                    disabled={!canCompare}
                    onClick={handleCompare}
                    className="rounded-lg font-bold px-4 whitespace-nowrap"
                  >
                    {t('jsonDiff:compareButton')}
                  </Button>
                </div>
              </div>

              {/* 输入区 */}
              <div className="flex flex-col md:flex-row gap-4">
                <JsonDiffInput
                  label={t('jsonDiff:leftLabel')}
                  placeholder={t('jsonDiff:leftPlaceholder')}
                  value={leftInput}
                  onChange={setLeftInput}
                  error={leftError}
                />
                <JsonDiffInput
                  label={t('jsonDiff:rightLabel')}
                  placeholder={t('jsonDiff:rightPlaceholder')}
                  value={rightInput}
                  onChange={setRightInput}
                  error={rightError}
                />
              </div>

              {/* 差异展示 */}
              {diffResult ? (
                <>
                  <DiffNavigator
                    total={total}
                    currentIndex={currentDiffIndex}
                    onPrev={handlePrev}
                    onNext={handleNext}
                  />
                  <DiffResult result={diffResult} viewMode={viewMode} activePath={activePath} />
                </>
              ) : (
                <div className="p-4 rounded-lg bg-muted border border-dashed border-input text-center">
                  <p className="text-sm font-semibold text-muted-foreground">
                    {t('jsonDiff:emptyHint')}
                  </p>
                </div>
              )}
            </>
          ) : pageMode === 'format' ? (
            <JsonFormatSection />
          ) : pageMode === 'yaml' ? (
            <JsonConvertSection translationPrefix="yamlMode" convertFunction={yamlConvert} />
          ) : pageMode === 'toml' ? (
            <JsonConvertSection translationPrefix="tomlMode" convertFunction={tomlConvert} />
          ) : (
            <JsonConvertSection
              translationPrefix="minifyMode"
              convertFunction={minifyConvert}
              convertButtonKey="minifyButton"
            />
          )}
        </div>
      </div>
    </div>
  );
}
