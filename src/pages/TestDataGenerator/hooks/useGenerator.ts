/**
 * 数据生成器 Hook
 * 管理 Web Worker 的创建、销毁和通信
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import type {
  FieldConfig,
  GenerateResult,
  GenerateProgress,
  WorkerMessage,
} from '@/types/testDataGenerator';

export interface UseGeneratorReturn {
  /** 是否正在生成 */
  isGenerating: boolean;
  /** 生成进度 */
  progress: GenerateProgress | null;
  /** 生成结果 */
  result: GenerateResult | null;
  /** 错误信息 */
  error: string | null;
  /** 开始生成 */
  generate: (fields: FieldConfig[], count: number, csvMode?: boolean) => void;
  /** 取消生成 */
  cancel: () => void;
  /** 清除结果 */
  clearResult: () => void;
}

export function useGenerator(): UseGeneratorReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerateProgress | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);

  // 清理 Worker
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  /**
   * 创建或复用 Worker
   */
  const getWorker = useCallback((): Worker => {
    if (workerRef.current) {
      return workerRef.current;
    }

    const worker = new Worker(new URL('@/workers/generator.worker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const data = e.data;
      const { type } = data;

      switch (type) {
        case 'progress':
          setProgress(data.payload as GenerateProgress);
          break;
        case 'complete':
          setIsGenerating(false);
          setResult(data.payload as GenerateResult);
          setProgress(null);
          break;
        case 'error':
          setIsGenerating(false);
          setError((data.payload as { error: string }).error);
          setProgress(null);
          break;
      }
    };

    worker.onerror = (err) => {
      console.error('[useGenerator] Worker 错误:', err);
      setIsGenerating(false);
      setError(err.message || 'Worker 运行错误');
      setProgress(null);
      // Worker 出错后销毁，下次重新创建
      workerRef.current?.terminate();
      workerRef.current = null;
    };

    workerRef.current = worker;
    return worker;
  }, []);

  /**
   * 开始生成
   */
  const generate = useCallback(
    (fields: FieldConfig[], count: number, csvMode = false) => {
      if (isGenerating) return;

      setIsGenerating(true);
      setProgress(null);
      setResult(null);
      setError(null);

      const worker = getWorker();
      const message: WorkerMessage = {
        type: 'start',
        payload: { fields, count, csvMode },
      };
      worker.postMessage(message);
    },
    [isGenerating, getWorker],
  );

  /**
   * 取消生成
   */
  const cancel = useCallback(() => {
    if (workerRef.current && isGenerating) {
      const message: WorkerMessage = { type: 'cancel' };
      workerRef.current.postMessage(message);
      setIsGenerating(false);
      setProgress(null);
    }
  }, [isGenerating]);

  /**
   * 清除结果
   */
  const clearResult = useCallback(() => {
    setResult(null);
    setProgress(null);
    setError(null);
  }, []);

  return {
    isGenerating,
    progress,
    result,
    error,
    generate,
    cancel,
    clearResult,
  };
}
