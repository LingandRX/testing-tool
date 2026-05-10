import { describe, it, expect } from 'vitest';
import { minifyJson } from '../jsonFormatter';

describe('minifyJson', () => {
  it('should minify formatted JSON', () => {
    const input = '{\n  "name": "test",\n  "value": 123\n}';
    const result = minifyJson(input);
    expect(result.minified).toBe('{"name":"test","value":123}');
  });

  it('should return empty result for empty input', () => {
    const result = minifyJson('');
    expect(result.minified).toBe('');
    expect(result.originalBytes).toBe(0);
    expect(result.minifiedBytes).toBe(0);
  });

  it('should return empty result for whitespace-only input', () => {
    const result = minifyJson('   ');
    expect(result.minified).toBe('');
  });

  it('should handle already minified JSON', () => {
    const input = '{"a":1}';
    const result = minifyJson(input);
    expect(result.minified).toBe('{"a":1}');
  });

  it('should remove all whitespace', () => {
    const input = '{\n  "key"  :  "value"  ,\n  "num"  :  42\n}';
    const result = minifyJson(input);
    expect(result.minified).toBe('{"key":"value","num":42}');
  });

  it('should preserve string content with spaces', () => {
    const input = '{"message":"hello world"}';
    const result = minifyJson(input);
    expect(result.minified).toBe('{"message":"hello world"}');
  });

  it('should handle arrays', () => {
    const input = '[\n  1,\n  2,\n  3\n]';
    const result = minifyJson(input);
    expect(result.minified).toBe('[1,2,3]');
  });

  it('should handle nested objects', () => {
    const input = '{\n  "a": {\n    "b": 1\n  }\n}';
    const result = minifyJson(input);
    expect(result.minified).toBe('{"a":{"b":1}}');
  });

  it('should handle primitive values', () => {
    expect(minifyJson('null').minified).toBe('null');
    expect(minifyJson('true').minified).toBe('true');
    expect(minifyJson('42').minified).toBe('42');
    expect(minifyJson('"hello"').minified).toBe('"hello"');
  });

  it('should throw SyntaxError for invalid JSON', () => {
    expect(() => minifyJson('{invalid}')).toThrow(SyntaxError);
  });

  it('should calculate byte sizes correctly', () => {
    const input = '{\n  "a": 1\n}';
    const result = minifyJson(input);
    expect(result.originalBytes).toBeGreaterThan(0);
    expect(result.minifiedBytes).toBeGreaterThan(0);
    // Minified should be smaller than original for formatted input
    expect(result.minifiedBytes).toBeLessThan(result.originalBytes);
  });

  it('should handle Unicode content', () => {
    const input = '{\n  "名前": "テスト"\n}';
    const result = minifyJson(input);
    expect(result.minified).toBe('{"名前":"テスト"}');
  });

  it('should handle empty object', () => {
    const result = minifyJson('{}');
    expect(result.minified).toBe('{}');
  });

  it('should handle empty array', () => {
    const result = minifyJson('[]');
    expect(result.minified).toBe('[]');
  });
});
