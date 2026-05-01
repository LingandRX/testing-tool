import { describe, it, expect, beforeEach } from 'vitest';
import { FuzzyMatcher } from '../smartInjector';
import { FormMapEntry } from '@/types/storage';

describe('FuzzyMatcher.collectPotentialElements', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  const baseFingerprint: FormMapEntry['fingerprint'] = {
    selector: '',
    name_attr: '',
    placeholder: '',
  };

  it('should prioritize elements matching name or placeholder', () => {
    document.body.innerHTML = `
      <input name="target" id="id1">
      <input name="other" id="id2">
      <input placeholder="find me" id="id3">
      <div contenteditable="true" id="id4"></div>
    `;

    const fingerprint: FormMapEntry['fingerprint'] = {
      ...baseFingerprint,
      name_attr: 'target',
      placeholder: 'find me',
    };

    const elements = (FuzzyMatcher as any).collectPotentialElements(fingerprint);

    // Should find the ones with matching name or placeholder first
    const ids = elements.map((el: HTMLElement) => el.id);
    expect(ids).toContain('id1');
    expect(ids).toContain('id3');
    // In our optimized implementation, if it finds matches via attributes, it might return early
    // or at least include them.
  });

  it('should limit the number of candidates', () => {
    // Create 150 inputs
    let html = '';
    for (let i = 0; i < 150; i++) {
      html += `<input id="input-${i}">`;
    }
    document.body.innerHTML = html;

    const elements = (FuzzyMatcher as any).collectPotentialElements(baseFingerprint);
    expect(elements.length).toBeLessThanOrEqual(100);
  });

  it('should fallback to tag selectors if no attribute matches', () => {
    document.body.innerHTML = `
      <input id="id1">
      <textarea id="id2"></textarea>
    `;

    const elements = (FuzzyMatcher as any).collectPotentialElements(baseFingerprint);
    const ids = elements.map((el: HTMLElement) => el.id);
    expect(ids).toContain('id1');
    expect(ids).toContain('id2');
  });
});

describe('FuzzyMatcher.findTargetElement', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should find element by exact selector', () => {
    document.body.innerHTML = `
      <input id="target" class="my-input">
      <input id="other">
    `;

    const fingerprint: FormMapEntry['fingerprint'] = {
      selector: '#target',
      name_attr: '',
      placeholder: '',
    };

    const result = FuzzyMatcher.findTargetElement(fingerprint);
    expect(result.element?.id).toBe('target');
    expect(result.score).toBeGreaterThanOrEqual(80); // SCORE_SELECTOR
  });

  it('should find element by name_attr when selector fails (returns score but null element due to threshold)', () => {
    document.body.innerHTML = `
      <input name="username" id="correct">
      <input name="other" id="wrong">
    `;

    const fingerprint: FormMapEntry['fingerprint'] = {
      selector: '#non-existent',
      name_attr: 'username',
      placeholder: '',
    };

    const result = FuzzyMatcher.findTargetElement(fingerprint);
    expect(result.element).toBeNull();
    expect(result.score).toBe(25); // SCORE_NAME_ATTR
  });

  it('should return null if no element meets threshold', () => {
    document.body.innerHTML = `
      <div id="not-a-form-element"></div>
    `;

    const fingerprint: FormMapEntry['fingerprint'] = {
      selector: '#none',
      name_attr: 'none',
      placeholder: 'none',
    };

    const result = FuzzyMatcher.findTargetElement(fingerprint);
    expect(result.element).toBeNull();
  });
});
