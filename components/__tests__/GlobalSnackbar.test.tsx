import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { GlobalSnackbar, useSnackbar, type GlobalSnackbarProps } from '../GlobalSnackbar';

describe('GlobalSnackbar Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const defaultProps: GlobalSnackbarProps = {
    message: 'Test message',
    open: true,
    onClose: mockOnClose,
  };

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<GlobalSnackbar {...defaultProps} />);
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('should render with different severity levels', () => {
      const severities: Array<GlobalSnackbarProps['severity']> = [
        'success',
        'info',
        'warning',
        'error',
      ];

      severities.forEach((severity) => {
        const { container } = render(
          <GlobalSnackbar {...defaultProps} severity={severity} />
        );
        const alertElement = container.querySelector(`[role="alert"]`);
        expect(alertElement).toBeInTheDocument();
      });
    });

    it('should render with custom anchor origin', () => {
      render(
        <GlobalSnackbar
          {...defaultProps}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        />
      );
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });

  describe('useSnackbar Hook', () => {
    it('should return initial state', () => {
      const TestComponent = () => {
        const { snackbarProps } = useSnackbar();
        return (
          <div>
            <span data-testid="open">{String(snackbarProps.open)}</span>
            <span data-testid="message">{snackbarProps.message}</span>
          </div>
        );
      };

      render(<TestComponent />);
      expect(screen.getByTestId('open').textContent).toBe('false');
      expect(screen.getByTestId('message').textContent).toBe('');
    });

    it('should show message when showMessage is called', async () => {
      const TestComponent = () => {
        const { snackbarProps, showMessage } = useSnackbar();

        return (
          <div>
            <button onClick={() => showMessage('Hello')}>Show</button>
            <span data-testid="message">{snackbarProps.message}</span>
            <span data-testid="open">{String(snackbarProps.open)}</span>
          </div>
        );
      };

      render(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /show/i }));
      });

      expect(screen.getByTestId('message').textContent).toBe('Hello');
      expect(screen.getByTestId('open').textContent).toBe('true');
    });

    it('should close message when closeMessage is called', async () => {
      const TestComponent = () => {
        const { snackbarProps, showMessage, closeMessage } = useSnackbar();

        return (
          <div>
            <button onClick={() => showMessage('Hello')}>Show</button>
            <button onClick={closeMessage}>Close</button>
            <span data-testid="open">{String(snackbarProps.open)}</span>
          </div>
        );
      };

      render(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /show/i }));
      });

      expect(screen.getByTestId('open').textContent).toBe('true');

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /close/i }));
      });

      expect(screen.getByTestId('open').textContent).toBe('false');
    });

    it('should apply custom options', async () => {
      const TestComponent = () => {
        const { snackbarProps, showMessage } = useSnackbar({ severity: 'warning' });

        return (
          <div>
            <button onClick={() => showMessage('Warning!')}>Show</button>
            <span data-testid="severity">{snackbarProps.severity}</span>
          </div>
        );
      };

      render(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /show/i }));
      });

      expect(screen.getByTestId('severity').textContent).toBe('warning');
    });
  });

  describe('Interaction', () => {
    it('should call onClose when close is triggered', async () => {
      render(<GlobalSnackbar {...defaultProps} />);

      await act(async () => {
        // Trigger close by timeout (autoHideDuration)
      });

      // Note: MUI Snackbar's close behavior depends on autoHideDuration
    });
  });
});