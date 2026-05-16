import { useEffect, useMemo, useState, useCallback } from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DataObjectIcon from '@mui/icons-material/DataObject';
import TransformIcon from '@mui/icons-material/Transform';
import CompressIcon from '@mui/icons-material/Compress';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/PageHeader';
import { jsonDiffPageStyles } from '@/config/pageTheme';
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
import SwtichButtonGroup from '@/components/SwitchButtonGroup';

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
  const { t } = useTranslation(['jsonDiff', 'jsonFormat']);
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
    diff: <CompareArrowsIcon />,
    format: <DataObjectIcon />,
    yaml: <TransformIcon />,
    toml: <TransformIcon />,
    minify: <CompressIcon />,
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
    <Box>
      <Container sx={{ p: 2 }}>
        <PageHeader
          title={t(modeTitles[pageMode].title)}
          subtitle={t(modeTitles[pageMode].subtitle)}
          icon={modeIcon[pageMode]}
          iconColor={jsonDiffPageStyles.primaryColor}
        />

        <Stack spacing={2.5}>
          {/* 页面模式切换器 */}
          <SwtichButtonGroup
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
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
              >
                <SwtichButtonGroup
                  value={viewMode}
                  onChange={(v: ViewMode) => setViewMode(v)}
                  options={[
                    { value: 'sideBySide', label: t('jsonDiff:sideBySideMode') },
                    { value: 'unified', label: t('jsonDiff:unifiedMode') },
                  ]}
                  size="small"
                />
                <Stack direction="row" spacing={1}>
                  <Button variant="text" onClick={handleClear} sx={{ borderRadius: 3 }}>
                    {t('jsonDiff:clearButton')}
                  </Button>
                  <Button
                    variant="contained"
                    disabled={!canCompare}
                    onClick={handleCompare}
                    sx={{ borderRadius: 3, fontWeight: 700, px: 3, whiteSpace: 'nowrap' }}
                  >
                    {t('jsonDiff:compareButton')}
                  </Button>
                </Stack>
              </Stack>

              {/* 输入区 */}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
              </Stack>

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
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'grey.50',
                    border: '1px dashed',
                    borderColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'grey.300',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {t('jsonDiff:emptyHint')}
                  </Typography>
                </Box>
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
        </Stack>
      </Container>
    </Box>
  );
}
