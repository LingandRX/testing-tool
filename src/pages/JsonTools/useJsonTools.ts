import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStorageState } from '@/utils/useStorageState';
import { diffJson } from '@/utils/diffEngine';
import { jsonToYaml } from '@/utils/jsonToYaml';
import { jsonToToml } from '@/utils/jsonToToml';
import { minifyJson } from '@/utils/jsonFormatter';
import { isValidPageMode, tryParse } from './constants';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { JsonToolsPageMode } from '@/types/storage';
import type { ConvertFunction, ViewMode } from './types';

type DiffResultValue = ReturnType<typeof diffJson>;

export interface UseJsonToolsReturn {
  isWide: boolean;
  pageMode: JsonToolsPageMode;
  setPageMode: (mode: JsonToolsPageMode) => void;
  leftInput: string;
  rightInput: string;
  setLeftInput: (val: string) => void;
  setRightInput: (val: string) => void;
  leftError: string | null;
  rightError: string | null;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  /** 当前生效的差异结果：宽屏为实时计算，窄屏为手动 Compare 后的结果 */
  activeResult: DiffResultValue | null;
  total: number;
  currentDiffIndex: number;
  handlePrev: () => void;
  handleNext: () => void;
  activePath: string | undefined;
  /** 窄屏：是否已点击 Compare 生成结果 */
  hasCompared: boolean;
  /** 窄屏：左右面板是否折叠 */
  collapsedA: boolean;
  collapsedB: boolean;
  toggleCollapseA: () => void;
  toggleCollapseB: () => void;
  /** 窄屏：两侧均有合法非空输入时可触发比对 */
  canCompare: boolean;
  handleCompare: () => void;
  /** 窄屏：折叠态单行预览文本 */
  previewA: string;
  previewB: string;
  yamlConvert: ConvertFunction;
  tomlConvert: ConvertFunction;
  minifyConvert: ConvertFunction;
}

export const buildPreview = (raw: string): string => {
  const single = raw.replace(/\s+/g, ' ').trim();
  const truncated = single.length > 80 ? `${single.slice(0, 80)}…` : single;
  return truncated ? `${truncated}（点击展开）` : '（点击展开）';
};

export function useJsonTools(): UseJsonToolsReturn {
  const isWide = useMediaQuery('(min-width: 768px)');

  const [pageMode, setPageMode] = useStorageState('jsonTools/pageMode', 'diff', isValidPageMode);

  const [leftInput, setLeftInputState] = useState('');
  const [rightInput, setRightInputState] = useState('');
  const [debouncedLeft, setDebouncedLeft] = useState('');
  const [debouncedRight, setDebouncedRight] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedLeft(leftInput);
      setDebouncedRight(rightInput);
    }, 250);
    return () => clearTimeout(handle);
  }, [leftInput, rightInput]);

  const parseState = useMemo(() => {
    const invalidMsg = '无效的 JSON 格式';
    return {
      left: tryParse(debouncedLeft, invalidMsg),
      right: tryParse(debouncedRight, invalidMsg),
    };
  }, [debouncedLeft, debouncedRight]);

  const leftError = parseState.left.error;
  const rightError = parseState.right.error;

  const [viewMode, setViewMode] = useState<ViewMode>('sideBySide');
  const activeViewMode = isWide ? viewMode : 'unified';
  const [currentDiffIndex, setCurrentDiffIndex] = useState(0);

  // 窄屏手动比对状态
  const [hasCompared, setHasCompared] = useState(false);
  const [manualResult, setManualResult] = useState<DiffResultValue | null>(null);
  const [collapsedA, setCollapsedA] = useState(false);
  const [collapsedB, setCollapsedB] = useState(false);

  // 宽屏：实时流式比对（保持原行为）
  const liveResult = useMemo<DiffResultValue | null>(() => {
    const { left, right } = parseState;
    if (left.error || right.error || debouncedLeft.trim() === '' || debouncedRight.trim() === '') {
      return null;
    }
    return diffJson(left.value, right.value);
  }, [parseState, debouncedLeft, debouncedRight]);

  const activeResult = isWide ? liveResult : manualResult;

  // 即时解析（用于比对按钮可用态与折叠预览，避免 250ms 延迟）
  const immediateParse = useMemo(() => {
    const invalidMsg = '无效的 JSON 格式';
    return {
      left: tryParse(leftInput, invalidMsg),
      right: tryParse(rightInput, invalidMsg),
    };
  }, [leftInput, rightInput]);

  const canCompare =
    leftInput.trim() !== '' &&
    rightInput.trim() !== '' &&
    !immediateParse.left.error &&
    !immediateParse.right.error;

  const previewA = useMemo(() => buildPreview(leftInput), [leftInput]);
  const previewB = useMemo(() => buildPreview(rightInput), [rightInput]);

  const setLeftInput = useCallback(
    (val: string) => {
      setLeftInputState(val);
      if (hasCompared) {
        setHasCompared(false);
        setManualResult(null);
        setCurrentDiffIndex(0);
      } else {
        setCurrentDiffIndex(0);
      }
    },
    [hasCompared],
  );

  const setRightInput = useCallback(
    (val: string) => {
      setRightInputState(val);
      if (hasCompared) {
        setHasCompared(false);
        setManualResult(null);
        setCurrentDiffIndex(0);
      } else {
        setCurrentDiffIndex(0);
      }
    },
    [hasCompared],
  );

  const handleCompare = useCallback(() => {
    if (!canCompare) return;
    const left = immediateParse.left.value;
    const right = immediateParse.right.value;
    const result = diffJson(left, right);
    setManualResult(result);
    setHasCompared(true);
    setCollapsedA(true);
    setCollapsedB(true);
    setCurrentDiffIndex(0);
  }, [canCompare, immediateParse]);

  const toggleCollapseA = useCallback(() => setCollapsedA((v) => !v), []);
  const toggleCollapseB = useCallback(() => setCollapsedB((v) => !v), []);

  const total = activeResult?.diffPaths.length ?? 0;

  const handlePrev = useCallback(() => {
    if (total === 0) return;
    setCurrentDiffIndex((idx) => (idx - 1 + total) % total);
  }, [total]);

  const handleNext = useCallback(() => {
    if (total === 0) return;
    setCurrentDiffIndex((idx) => (idx + 1) % total);
  }, [total]);

  const activePath =
    activeResult && total > 0 && currentDiffIndex < total
      ? activeResult.diffPaths[currentDiffIndex]
      : undefined;

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
    isWide,
    pageMode,
    setPageMode,
    leftInput,
    rightInput,
    setLeftInput,
    setRightInput,
    leftError,
    rightError,
    viewMode: activeViewMode,
    setViewMode,
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
    yamlConvert,
    tomlConvert,
    minifyConvert,
  };
}
