import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RightClickRestorerPage from '../index';

const mockUnlock = vi.fn();

vi.mock('../useRightClickRestorer', () => ({
  useRightClickRestorer: () => ({
    domain: 'example.com',
    isLoading: false,
    isUnlocked: false,
    isUnsupported: false,
    unlock: mockUnlock,
  }),
}));

describe('RightClickRestorerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render current domain', () => {
    render(<RightClickRestorerPage />);
    expect(screen.getByText(/example\.com/)).toBeInTheDocument();
  });

  it('should render locked status', () => {
    render(<RightClickRestorerPage />);
    expect(screen.getByText(/statusLocked/)).toBeInTheDocument();
  });

  it('should call unlock when button clicked', () => {
    render(<RightClickRestorerPage />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockUnlock).toHaveBeenCalled();
  });
});
