import { describe, it, expect } from 'vitest';
import { diffJson } from '../diffEngine';

describe('diffJson', () => {
  it('should detect added property', () => {
    const left = { a: 1 };
    const right = { a: 1, b: 2 };
    const result = diffJson(left, right);
    expect(result.diffCount).toBe(1);
    expect(result.diffPaths).toContain('$.b');
    const bNode = result.root.children?.find((n) => n.key === 'b');
    expect(bNode?.type).toBe('added');
  });

  it('should detect removed property', () => {
    const left = { a: 1, b: 2 };
    const right = { a: 1 };
    const result = diffJson(left, right);
    expect(result.diffCount).toBe(1);
    expect(result.diffPaths).toContain('$.b');
  });

  it('should detect modified value', () => {
    const left = { a: 1 };
    const right = { a: 2 };
    const result = diffJson(left, right);
    expect(result.diffCount).toBe(1);
    expect(result.diffPaths).toContain('$.a');
    const aNode = result.root.children?.find((n) => n.key === 'a');
    expect(aNode?.type).toBe('modified');
    expect(aNode?.oldValue).toBe(1);
    expect(aNode?.newValue).toBe(2);
  });

  it('should handle nested objects', () => {
    const left = { a: { b: 1 } };
    const right = { a: { b: 2 } };
    const result = diffJson(left, right);
    expect(result.diffCount).toBe(1);
    expect(result.diffPaths).toContain('$.a.b');
  });

  it('should handle arrays', () => {
    const left = [1, 2];
    const right = [1, 3];
    const result = diffJson(left, right);
    expect(result.diffCount).toBe(1);
    expect(result.diffPaths).toContain('$[1]');
  });

  it('should return unchanged for identical objects', () => {
    const obj = { a: 1, b: { c: 2 } };
    const result = diffJson(obj, obj);
    expect(result.diffCount).toBe(0);
    expect(result.root.type).toBe('unchanged');
  });

  it('should handle type mismatch', () => {
    const left = { a: 1 };
    const right = { a: '1' };
    const result = diffJson(left, right);
    expect(result.diffCount).toBe(1);
    const aNode = result.root.children?.find((n) => n.key === 'a');
    expect(aNode?.type).toBe('modified');
  });

  it('should handle empty objects', () => {
    const result = diffJson({}, {});
    expect(result.diffCount).toBe(0);
  });
});
