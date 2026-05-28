import { describe, it, expect } from 'vitest';
import { jsonToYaml } from '../jsonToYaml';

describe('jsonToYaml', () => {
  it('should convert a simple object', () => {
    const result = jsonToYaml('{"name":"test","value":123}');
    expect(result.output).toBe('name: test\nvalue: 123');
  });

  it('should convert a nested object', () => {
    const result = jsonToYaml('{"user":{"name":"Alice","age":30}}');
    expect(result.output).toBe('user:\n  name: Alice\n  age: 30');
  });

  it('should convert an array of primitives', () => {
    const result = jsonToYaml('[1,2,3]');
    expect(result.output).toBe('- 1\n- 2\n- 3');
  });

  it('should convert an array of objects', () => {
    const result = jsonToYaml('[{"name":"A"},{"name":"B"}]');
    expect(result.output).toContain('name: A');
    expect(result.output).toContain('name: B');
    expect(result.output).toContain('- name: A');
    expect(result.output).toContain('- name: B');
  });

  it('should handle null values', () => {
    const result = jsonToYaml('{"key":null}');
    expect(result.output).toBe('key: null');
  });

  it('should handle boolean values', () => {
    const result = jsonToYaml('{"active":true,"deleted":false}');
    expect(result.output).toBe('active: true\ndeleted: false');
  });

  it('should handle number values', () => {
    const result = jsonToYaml('{"count":42,"price":3.14}');
    expect(result.output).toBe('count: 42\nprice: 3.14');
  });

  it('should handle empty object', () => {
    const result = jsonToYaml('{}');
    expect(result.output).toBe('{}');
  });

  it('should handle empty array', () => {
    const result = jsonToYaml('[]');
    expect(result.output).toContain('[]');
  });

  it('should handle empty string', () => {
    const result = jsonToYaml('');
    expect(result.output).toBe('');
    expect(result.originalBytes).toBe(0);
  });

  it('should handle whitespace-only input', () => {
    const result = jsonToYaml('   ');
    expect(result.output).toBe('');
  });

  it('should quote strings with special characters', () => {
    const result = jsonToYaml('{"key":"value: with colon"}');
    expect(result.output).toContain('"value: with colon"');
  });

  it('should quote strings that look like YAML keywords', () => {
    const result = jsonToYaml('{"key":"null"}');
    expect(result.output).toContain('"null"');
  });

  it('should handle deeply nested objects', () => {
    const result = jsonToYaml('{"a":{"b":{"c":1}}}');
    expect(result.output).toBe('a:\n  b:\n    c: 1');
  });

  it('should calculate byte sizes', () => {
    const result = jsonToYaml('{"a":1}');
    expect(result.originalBytes).toBeGreaterThan(0);
    expect(result.outputBytes).toBeGreaterThan(0);
  });

  it('should throw SyntaxError for invalid JSON', () => {
    expect(() => jsonToYaml('{invalid}')).toThrow(SyntaxError);
  });

  it('should handle keys with special characters', () => {
    const result = jsonToYaml('{"key with spaces":"value"}');
    expect(result.output).toContain('"key with spaces"');
  });

  it('should handle nested arrays in objects', () => {
    const result = jsonToYaml('{"items":[1,2,3]}');
    expect(result.output).toContain('items:');
    expect(result.output).toContain('- 1');
    expect(result.output).toContain('- 2');
    expect(result.output).toContain('- 3');
  });

  it('should handle primitive top-level values', () => {
    expect(jsonToYaml('"hello"').output).toBe('hello');
    expect(jsonToYaml('42').output).toBe('42');
    expect(jsonToYaml('true').output).toBe('true');
    expect(jsonToYaml('null').output).toBe('null');
  });
});
