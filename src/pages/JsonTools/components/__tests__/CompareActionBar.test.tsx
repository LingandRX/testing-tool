import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import CompareActionBar from '../CompareActionBar';

describe('CompareActionBar', () => {
  it('不可比较时按钮禁用', () => {
    render(
      <CompareActionBar
        canCompare={false}
        onCompare={() => {}}
        hasCompared={false}
        total={0}
        currentIndex={0}
        onPrev={() => {}}
        onNext={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: /Compare A & B/i })).toBeDisabled();
  });

  it('可比较时点击触发 onCompare', async () => {
    const user = userEvent.setup();
    const onCompare = vi.fn();
    render(
      <CompareActionBar
        canCompare={true}
        onCompare={onCompare}
        hasCompared={false}
        total={0}
        currentIndex={0}
        onPrev={() => {}}
        onNext={() => {}}
      />,
    );
    await user.click(screen.getByRole('button', { name: /Compare A & B/i }));
    expect(onCompare).toHaveBeenCalled();
  });

  it('已比较后展示 DiffNavigator（上一处/下一处）', () => {
    render(
      <CompareActionBar
        canCompare={true}
        onCompare={() => {}}
        hasCompared={true}
        total={3}
        currentIndex={1}
        onPrev={() => {}}
        onNext={() => {}}
      />,
    );
    expect(screen.getByLabelText('上一个')).toBeInTheDocument();
    expect(screen.getByLabelText('下一个')).toBeInTheDocument();
    expect(screen.queryByText('无差异')).not.toBeInTheDocument();
  });
});
