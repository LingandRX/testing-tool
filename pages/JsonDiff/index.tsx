import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/PageHeader';
import { jsonDiffPageStyles } from '@/config/pageTheme';
import JsonDiffInput from './JsonDiffInput';
import DiffResult from './DiffResult';
import DiffNavigator from './DiffNavigator';
import { diffJson } from './diffEngine';
import type { DiffResult as DiffResultType, ViewMode } from './types';

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

export default function Index() {
  const { t } = useTranslation(['jsonDiff']);
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

  return (
    <Box>
      <Container sx={{ p: 2 }}>
        <PageHeader
          title={t('jsonDiff:pageTitle')}
          subtitle={t('jsonDiff:pageSubtitle')}
          icon={<CompareArrowsIcon />}
          iconColor={jsonDiffPageStyles.primaryColor}
        />

        <Stack spacing={2.5}>
          {/* 工具栏 */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <ToggleButtonGroup
              size="small"
              exclusive
              value={viewMode}
              onChange={(_, v: ViewMode | null) => v && setViewMode(v)}
              sx={{ borderRadius: 3 }}
            >
              <ToggleButton value="sideBySide" sx={{ px: 2, fontWeight: 700 }}>
                {t('jsonDiff:sideBySideMode')}
              </ToggleButton>
              <ToggleButton value="unified" sx={{ px: 2, fontWeight: 700 }}>
                {t('jsonDiff:unifiedMode')}
              </ToggleButton>
            </ToggleButtonGroup>
            <Stack direction="row" spacing={1}>
              <Button variant="text" onClick={handleClear} sx={{ borderRadius: 3 }}>
                {t('jsonDiff:clearButton')}
              </Button>
              <Button
                variant="contained"
                disabled={!canCompare}
                onClick={handleCompare}
                sx={{ borderRadius: 3, fontWeight: 700, px: 3 }}
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
        </Stack>
      </Container>
    </Box>
  );
}
