import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResultPanel from '../ResultPanel';
import type { GenerateResult } from '@/types/testDataGenerator';

function createResult(overrides: Partial<GenerateResult> = {}): GenerateResult {
  return {
    success: true,
    warnings: [],
    stats: {
      total: 100,
      success: 100,
      failed: 0,
      duration: 1200,
    },
    ...overrides,
  };
}

describe('ResultPanel', () => {
  it('警告超过 5 条时应显示剩余警告数量', () => {
    const warnings = Array.from({ length: 8 }, (_, index) => `警告 ${index + 1}`);

    render(<ResultPanel result={createResult({ warnings })} />);

    expect(screen.getByText('警告 1')).toBeInTheDocument();
    expect(screen.getByText('警告 5')).toBeInTheDocument();
    expect(screen.queryByText('警告 6')).not.toBeInTheDocument();
    expect(screen.getByText('... 还有 3 条警告')).toBeInTheDocument();
    expect(screen.queryByText(/\{\{count\}\}/)).not.toBeInTheDocument();
  });

  it('警告不超过 5 条时不应显示剩余提示', () => {
    const warnings = ['警告 1', '警告 2', '警告 3'];

    render(<ResultPanel result={createResult({ warnings })} />);

    expect(screen.getByText('警告 1')).toBeInTheDocument();
    expect(screen.getByText('警告 3')).toBeInTheDocument();
    expect(screen.queryByText(/还有 \d+ 条警告/)).not.toBeInTheDocument();
  });
});
