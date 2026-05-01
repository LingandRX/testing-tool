import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VisualHighlighter } from '../highlighter';
import { FormMapEntry } from '@/types/storage';

describe('VisualHighlighter', () => {
  let highlighter: VisualHighlighter;

  beforeEach(() => {
    highlighter = new VisualHighlighter();
    vi.useFakeTimers();
  });

  const mockEntry: FormMapEntry = {
    id: '1',
    label_display: 'Test Field',
    fingerprint: { selector: 'input', name_attr: '', placeholder: '' },
    action_logic: { type: 'text', strategy: 'fixed', value: 'test' },
    ui_state: { is_selected: false },
  };

  it('should use deep copy when calling flash', () => {
    const entries = [mockEntry];
    highlighter.draw(entries);

    // Modify the original entry object after drawing
    entries[0].label_display = 'Changed Label';

    // The highlighter should have its own copy
    expect((highlighter as any).currentEntries[0].label_display).toBe('Test Field');
  });

  it('should restore deep copied state after flash', () => {
    highlighter.show();
    const originalEntries = [mockEntry];
    highlighter.draw(originalEntries);

    const flashEntries = [{ ...mockEntry, id: '2', label_display: 'Flash Field' }];
    highlighter.flash(flashEntries, 1000);

    expect((highlighter as any).currentEntries[0].label_display).toBe('Flash Field');

    // Modify originalEntries during flash
    originalEntries[0].label_display = 'Modified During Flash';

    // But then draw is called with new state
    highlighter.draw([{ ...mockEntry, label_display: 'New State' }]);

    // Fast-forward
    vi.advanceTimersByTime(1000);

    // Should restore 'New State', not 'Test Field' or 'Modified During Flash'
    expect((highlighter as any).currentEntries[0].label_display).toBe('New State');
  });

  it('should handle concurrent updates during flash correctly', () => {
    highlighter.show(); // wasVisibleBeforeFlash = true
    const entry1 = { ...mockEntry, id: '1' };
    highlighter.draw([entry1]);

    highlighter.flash([{ ...mockEntry, id: 'flash' }], 1000);

    // Update state while flashing
    const entry2 = { ...mockEntry, id: '2' };
    highlighter.draw([entry2]);

    vi.advanceTimersByTime(1000);

    expect((highlighter as any).currentEntries[0].id).toBe('2');
  });
});
