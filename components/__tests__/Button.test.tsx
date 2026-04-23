import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<Button>Click Me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    it('should render with custom text', () => {
      render(<Button>Submit</Button>);
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('should render with different variants', () => {
      const { rerender } = render(<Button variant="contained">Contained</Button>);
      expect(screen.getByRole('button', { name: /contained/i })).toBeInTheDocument();

      rerender(<Button variant="outlined">Outlined</Button>);
      expect(screen.getByRole('button', { name: /outlined/i })).toBeInTheDocument();

      rerender(<Button variant="text">Text</Button>);
      expect(screen.getByRole('button', { name: /text/i })).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);

      fireEvent.click(screen.getByRole('button', { name: /click me/i }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          Disabled Button
        </Button>,
      );

      fireEvent.click(screen.getByRole('button', { name: /disabled button/i }));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('should apply fullWidth prop', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button', { name: /full width/i });
      expect(button).toHaveClass('MuiButton-fullWidth');
    });
  });

  describe('States', () => {
    it('should render in loading state', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button', { name: /loading/i });
      expect(button).toHaveClass('MuiButton-loading');
    });

    it('should render as disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button', { name: /disabled/i });
      expect(button).toBeDisabled();
    });
  });
});
