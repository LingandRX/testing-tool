import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGenerator } from '@/pages/TestDataGenerator/hooks/useGenerator';
import type { FieldConfig, WorkerResponseMessage } from '@/types/testDataGenerator';

const mockField: FieldConfig = {
  id: 'field-1',
  name: 'username',
  generatorId: 'string',
  params: {},
  required: true,
  nullRate: 0,
  unique: false,
};

type WorkerListener = (event: MessageEvent<WorkerResponseMessage>) => void;

class MockWorker {
  static instances: MockWorker[] = [];
  onmessage: WorkerListener | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  postedMessages: unknown[] = [];

  constructor(_url: URL, _options?: WorkerOptions) {
    MockWorker.instances.push(this);
  }

  postMessage(message: unknown) {
    this.postedMessages.push(message);
  }

  terminate() {
    const index = MockWorker.instances.indexOf(this);
    if (index >= 0) {
      MockWorker.instances.splice(index, 1);
    }
  }

  emit(message: WorkerResponseMessage) {
    this.onmessage?.({ data: message } as MessageEvent<WorkerResponseMessage>);
  }
}

describe('useGenerator', () => {
  beforeEach(() => {
    MockWorker.instances = [];
    vi.stubGlobal('Worker', MockWorker);
  });

  it('应忽略过期 generationId 的 complete 消息', async () => {
    const { result } = renderHook(() => useGenerator());

    act(() => {
      result.current.generate([mockField], 10);
    });

    const worker = MockWorker.instances[0];
    expect(worker).toBeDefined();

    act(() => {
      result.current.cancel();
    });

    act(() => {
      result.current.generate([mockField], 5);
    });

    act(() => {
      worker.emit({
        type: 'complete',
        generationId: 1,
        payload: {
          success: true,
          data: [{ username: 'stale' }],
          stats: { total: 10, success: 10, failed: 0, duration: 1 },
        },
      });
    });

    expect(result.current.result).toBeNull();
    expect(result.current.isGenerating).toBe(true);

    act(() => {
      worker.emit({
        type: 'complete',
        generationId: 3,
        payload: {
          success: true,
          data: [{ username: 'fresh' }],
          stats: { total: 5, success: 5, failed: 0, duration: 1 },
        },
      });
    });

    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false);
    });
    expect(result.current.result?.data?.[0]).toEqual({ username: 'fresh' });
  });

  it('cancel 后应发送 cancel 消息并使 generationId 失效', () => {
    const { result } = renderHook(() => useGenerator());

    act(() => {
      result.current.generate([mockField], 100);
    });

    const worker = MockWorker.instances[0];

    act(() => {
      result.current.cancel();
    });

    expect(result.current.isGenerating).toBe(false);
    expect(worker.postedMessages).toEqual(expect.arrayContaining([{ type: 'cancel' }]));
  });
});
