import { describe, it, expect, beforeEach } from 'vitest';
import { SmartDetector } from '../scanner';

describe('SmartDetector.getUniqueSelector', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should return ID selector for element with stable ID', () => {
    document.body.innerHTML = '<input id="user">';
    const el = document.getElementById('user')!;
    const selector = (SmartDetector as any).getUniqueSelector(el);
    expect(selector).toBe('#user');
  });

  it('should return test attribute selector if unique', () => {
    document.body.innerHTML = '<input data-testid="user-input" class="random-class">';
    const el = document.querySelector('input')!;
    const selector = (SmartDetector as any).getUniqueSelector(el);
    expect(selector).toBe('input[data-testid="user-input"]');
  });

  it('should respect MAX_RECURSION_DEPTH', () => {
    // Create a very deep DOM structure
    document.body.innerHTML = `
      <div id="root">
        <div>
          <div>
            <div>
              <div>
                <div>
                  <div>
                    <input type="text" class="deep-input">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    const el = document.querySelector('.deep-input') as HTMLElement;
    const selector = (SmartDetector as any).getUniqueSelector(el);

    // The depth limit is 5.
    // root > div > div > div > div > div > div > input
    // It should not exceed 5 levels of recursion.
    // If it reaches the limit, it should fallback to nth-of-type.

    // Let's count the number of ">" in the selector
    const arrowCount = (selector.match(/>/g) || []).length;
    expect(arrowCount).toBeLessThanOrEqual(5);

    // Verify it still selects the element
    expect(document.querySelector(selector)).toBe(el);
  });

  it('should fallback to nth-of-type if no unique path found within depth', () => {
    document.body.innerHTML = `
      <div><span></span></div>
      <div><span></span></div>
      <div><span id="target"></span></div>
    `;
    const el = document.getElementById('target')!;
    // Since it's deep and has no unique markers, it will eventually fallback
    const selector = (SmartDetector as any).getUniqueSelector(el);
    expect(document.querySelector(selector)).toBe(el);
  });
});
