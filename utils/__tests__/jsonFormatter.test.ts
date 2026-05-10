import { describe, it, expect } from 'vitest';
import { formatJson, validateJson, type JsonFormatOptions } from '../jsonFormatter';

describe('formatJson', () => {
  const defaultOptions: JsonFormatOptions = { indentSize: 2, sortKeys: false };

  it('should format minified JSON', () => {
    const input = '{"name":"test","value":123}';
    const result = formatJson(input, defaultOptions);
    expect(result.formatted).toBe('{\n  "name": "test",\n  "value": 123\n}');
    expect(result.originalBytes).toBeGreaterThan(0);
    expect(result.formattedBytes).toBeGreaterThan(0);
  });

  it('should return empty result for empty input', () => {
    const result = formatJson('', defaultOptions);
    expect(result.formatted).toBe('');
    expect(result.originalBytes).toBe(0);
    expect(result.formattedBytes).toBe(0);
  });

  it('should return empty result for whitespace-only input', () => {
    const result = formatJson('   ', defaultOptions);
    expect(result.formatted).toBe('');
  });

  it('should format with custom indent size', () => {
    const input = '{"a":1}';
    const result4 = formatJson(input, { indentSize: 4, sortKeys: false });
    expect(result4.formatted).toBe('{\n    "a": 1\n}');

    const result8 = formatJson(input, { indentSize: 8, sortKeys: false });
    expect(result8.formatted).toBe('{\n        "a": 1\n}');
  });

  it('should sort keys alphabetically when sortKeys is true', () => {
    const input = '{"c":3,"a":1,"b":2}';
    const result = formatJson(input, { indentSize: 2, sortKeys: true });
    expect(result.formatted).toBe('{\n  "a": 1,\n  "b": 2,\n  "c": 3\n}');
  });

  it('should sort nested object keys recursively', () => {
    const input = '{"z":1,"a":{"d":4,"b":2,"c":3}}';
    const result = formatJson(input, { indentSize: 2, sortKeys: true });
    expect(result.formatted).toBe(
      '{\n  "a": {\n    "b": 2,\n    "c": 3,\n    "d": 4\n  },\n  "z": 1\n}',
    );
  });

  it('should not sort keys by default', () => {
    const input = '{"c":3,"a":1,"b":2}';
    const result = formatJson(input, defaultOptions);
    expect(result.formatted).toBe('{\n  "c": 3,\n  "a": 1,\n  "b": 2\n}');
  });

  it('should handle arrays correctly', () => {
    const input = '[1,2,3]';
    const result = formatJson(input, defaultOptions);
    expect(result.formatted).toBe('[\n  1,\n  2,\n  3\n]');
  });

  it('should handle nested arrays and objects', () => {
    const input = '{"users":[{"name":"Alice"},{"name":"Bob"}]}';
    const result = formatJson(input, defaultOptions);
    expect(result.formatted).toContain('"users"');
    expect(result.formatted).toContain('"Alice"');
    expect(result.formatted).toContain('"Bob"');
  });

  it('should handle primitive values', () => {
    expect(formatJson('null', defaultOptions).formatted).toBe('null');
    expect(formatJson('true', defaultOptions).formatted).toBe('true');
    expect(formatJson('42', defaultOptions).formatted).toBe('42');
    expect(formatJson('"hello"', defaultOptions).formatted).toBe('"hello"');
  });

  it('should throw SyntaxError for invalid JSON', () => {
    expect(() => formatJson('{invalid}', defaultOptions)).toThrow(SyntaxError);
  });

  it('should calculate byte sizes correctly', () => {
    const input = '{"a":1}';
    const result = formatJson(input, defaultOptions);
    // ASCII characters: each character = 1 byte
    expect(result.originalBytes).toBe(input.trim().length);
    expect(result.formattedBytes).toBe(result.formatted.length);
  });

  it('should handle JSON with Unicode characters', () => {
    const input = '{"name":"测试"}';
    const result = formatJson(input, defaultOptions);
    expect(result.formatted).toContain('"测试"');
    // UTF-8: each Chinese character is 3 bytes
    expect(result.originalBytes).toBeGreaterThan(input.trim().length);
  });

  it('should sort keys in arrays containing objects', () => {
    const input = '[{"z":1,"a":2}]';
    const result = formatJson(input, { indentSize: 2, sortKeys: true });
    expect(result.formatted).toContain('"a": 2');
    expect(result.formatted).toContain('"z": 1');
    // Ensure sorted order
    const aIndex = result.formatted.indexOf('"a": 2');
    const zIndex = result.formatted.indexOf('"z": 1');
    expect(aIndex).toBeLessThan(zIndex);
  });

  it('should handle already formatted JSON', () => {
    const input = '{\n  "name": "test",\n  "value": 123\n}';
    const result = formatJson(input, defaultOptions);
    expect(result.formatted).toBe('{\n  "name": "test",\n  "value": 123\n}');
  });
});

describe('validateJson', () => {
  it('should return null for valid JSON object', () => {
    expect(validateJson('{"a":1}')).toBeNull();
  });

  it('should return null for valid JSON array', () => {
    expect(validateJson('[1,2,3]')).toBeNull();
  });

  it('should return null for valid JSON primitive', () => {
    expect(validateJson('null')).toBeNull();
    expect(validateJson('true')).toBeNull();
    expect(validateJson('42')).toBeNull();
    expect(validateJson('"hello"')).toBeNull();
  });

  it('should return null for empty input', () => {
    expect(validateJson('')).toBeNull();
  });

  it('should return null for whitespace-only input', () => {
    expect(validateJson('   ')).toBeNull();
  });

  it('should return error message for invalid JSON', () => {
    const error = validateJson('{invalid}');
    expect(error).not.toBeNull();
    expect(typeof error).toBe('string');
  });

  it('should return error for unclosed bracket', () => {
    expect(validateJson('{"a":1')).not.toBeNull();
  });

  it('should return error for trailing comma', () => {
    expect(validateJson('{"a":1,}')).not.toBeNull();
  });

  it('should handle JSON with leading/trailing whitespace', () => {
    expect(validateJson('  {"a":1}  ')).toBeNull();
  });
});
