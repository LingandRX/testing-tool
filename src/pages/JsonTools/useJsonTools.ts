import { useCallback, useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/utils/chromeI18n';
import { useStorageState } from '@/utils/useStorageState';
import { diffJson } from '@/utils/diffEngine';
import { jsonToYaml } from '@/utils/jsonToYaml';
import { jsonToToml } from '@/utils/jsonToToml';
import { minifyJson } from '@/utils/jsonFormatter';
import { isValidPageMode, tryParse } from './constants';
import type { JsonToolsPageMode } from '@/types/storage';
import type { ConvertFunction, ViewMode } from './types';

export interface UseJsonToolsReturn {
  pageMode: JsonToolsPageMode;
  setPageMode: (mode: JsonToolsPageMode) => void;
  // Diff mode state
  leftInput: string;
  rightInput: string;
  setLeftInput: (val: string) => void;
  setRightInput: (val: string) => void;
  leftError: string | null;
  rightError: string | null;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  diffResult: ReturnType<typeof diffJson> | null;
  total: number;
  currentDiffIndex: number;
  handlePrev: () => void;
  handleNext: () => void;
  activePath: string | undefined;
  // Convert functions
  yamlConvert: ConvertFunction;
  tomlConvert: ConvertFunction;
  minifyConvert: ConvertFunction;
}

export function useJsonTools(): UseJsonToolsReturn {
  const { t } = useI18n(['jsonDiff', 'jsonFormat']);
  const [pageMode, setPageMode] = useStorageState('jsonTools/pageMode', 'diff', isValidPageMode);

  // Diff inputs
  const [leftInput, setLeftInput] = useState('');
  const [rightInput, setRightInput] = useState('');
  const [debouncedLeft, setDebouncedLeft] = useState('');
  const [debouncedRight, setDebouncedRight] = useState('');

  // Debounce
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedLeft(leftInput);
      setDebouncedRight(rightInput);
    }, 250);
    return () => clearTimeout(handle);
  }, [leftInput, rightInput]);

  // Parse debounced inputs
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

  // Real-time diff computation
  const diffResult = useMemo(() => {
    const { left, right } = parseState;
    if (left.error || right.error || debouncedLeft.trim() === '' || debouncedRight.trim() === '') {
      return null;
    }
    return diffJson(left.value, right.value);
  }, [parseState, debouncedLeft, debouncedRight]);

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

  // Convert functions
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

  return {
    pageMode,
    setPageMode,
    leftInput,
    rightInput,
    setLeftInput: (val: string) => {
      setLeftInput(val);
      setCurrentDiffIndex(0);
    },
    setRightInput: (val: string) => {
      setRightInput(val);
      setCurrentDiffIndex(0);
    },
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
  };
}
