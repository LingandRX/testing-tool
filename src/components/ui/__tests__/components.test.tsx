import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Button } from '../button';
import { Input } from '../input';
import { Skeleton } from '../skeleton';
import { Tooltip } from '../tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';

describe('UI Components Completion', () => {
  describe('Button xs sizes', () => {
    it('renders Button with size="xs"', () => {
      render(<Button size="xs">XS Button</Button>);
      const btn = screen.getByRole('button', { name: 'XS Button' });
      expect(btn.className).toContain('h-7');
      expect(btn.className).toContain('text-xs');
    });

    it('renders Button with size="iconXs"', () => {
      render(<Button size="iconXs">Icon</Button>);
      const btn = screen.getByRole('button');
      expect(btn.className).toContain('h-6');
      expect(btn.className).toContain('w-6');
    });
  });

  describe('Input inputSize variants', () => {
    it('renders Input with default inputSize', () => {
      render(<Input data-testid="default-input" />);
      const input = screen.getByTestId('default-input');
      expect(input.className).toContain('h-10');
    });

    it('renders Input with inputSize="xs"', () => {
      render(<Input inputSize="xs" data-testid="xs-input" />);
      const input = screen.getByTestId('xs-input');
      expect(input.className).toContain('h-7');
      expect(input.className).toContain('text-xs');
    });
  });

  describe('Skeleton component', () => {
    it('renders Skeleton div with animate-pulse class', () => {
      render(<Skeleton data-testid="skeleton" className="w-20 h-4" />);
      const sk = screen.getByTestId('skeleton');
      expect(sk.className).toContain('animate-pulse');
      expect(sk.className).toContain('w-20');
    });
  });

  describe('Tooltip component', () => {
    it('shows content on hover after delay and hides on leave', () => {
      vi.useFakeTimers();

      render(
        <Tooltip content="Tooltip Content" delayMs={100}>
          <button>Hover Me</button>
        </Tooltip>,
      );

      expect(screen.queryByRole('tooltip')).toBeNull();

      const btn = screen.getByRole('button', { name: 'Hover Me' });
      fireEvent.mouseEnter(btn);

      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(screen.getByRole('tooltip')).toHaveTextContent('Tooltip Content');

      fireEvent.mouseLeave(btn);
      expect(screen.queryByRole('tooltip')).toBeNull();

      vi.useRealTimers();
    });
  });

  describe('Tabs component', () => {
    it('switches active tab on click', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>,
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).toBeNull();

      fireEvent.click(screen.getByRole('tab', { name: 'Tab 2' }));

      expect(screen.queryByText('Content 1')).toBeNull();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });
  });
});
