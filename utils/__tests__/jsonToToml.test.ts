import { describe, it, expect } from 'vitest';
import { jsonToToml } from '../jsonToToml';

describe('jsonToToml', () => {
  it('should convert a simple object', () => {
    const result = jsonToToml('{"name":"test","value":123}');
    expect(result.output).toContain('name = "test"');
    expect(result.output).toContain('value = 123');
  });

  it('should convert a nested object with table headers', () => {
    const result = jsonToToml('{"database":{"host":"localhost","port":5432}}');
    expect(result.output).toContain('[database]');
    expect(result.output).toContain('host = "localhost"');
    expect(result.output).toContain('port = 5432');
  });

  it('should handle boolean values', () => {
    const result = jsonToToml('{"active":true,"deleted":false}');
    expect(result.output).toContain('active = true');
    expect(result.output).toContain('deleted = false');
  });

  it('should handle null values as empty string', () => {
    const result = jsonToToml('{"key":null}');
    expect(result.output).toContain('key = ""');
  });

  it('should handle number values', () => {
    const result = jsonToToml('{"count":42,"price":3.14}');
    expect(result.output).toContain('count = 42');
    expect(result.output).toContain('price = 3.14');
  });

  it('should handle arrays of primitives', () => {
    const result = jsonToToml('{"ports":[80,443,8080]}');
    expect(result.output).toContain('ports = [80, 443, 8080]');
  });

  it('should handle arrays of strings', () => {
    const result = jsonToToml('{"tags":["web","api"]}');
    expect(result.output).toContain('tags = ["web", "api"]');
  });

  it('should handle object arrays with table array syntax', () => {
    const result = jsonToToml('{"users":[{"name":"Alice"},{"name":"Bob"}]}');
    expect(result.output).toContain('[[users]]');
    expect(result.output).toContain('name = "Alice"');
    expect(result.output).toContain('name = "Bob"');
  });

  it('should handle deeply nested objects', () => {
    const result = jsonToToml('{"a":{"b":{"c":1}}}');
    expect(result.output).toContain('[a.b]');
    expect(result.output).toContain('c = 1');
  });

  it('should handle empty object', () => {
    const result = jsonToToml('{}');
    expect(result.output).toBe('');
  });

  it('should handle empty string input', () => {
    const result = jsonToToml('');
    expect(result.output).toBe('');
    expect(result.originalBytes).toBe(0);
  });

  it('should calculate byte sizes', () => {
    const result = jsonToToml('{"a":1}');
    expect(result.originalBytes).toBeGreaterThan(0);
    expect(result.outputBytes).toBeGreaterThan(0);
  });

  it('should throw SyntaxError for invalid JSON', () => {
    expect(() => jsonToToml('{invalid}')).toThrow(SyntaxError);
  });

  it('should throw Error for non-object top-level value', () => {
    expect(() => jsonToToml('"hello"')).toThrow(
      'TOML requires the top-level value to be an object',
    );
    expect(() => jsonToToml('[1,2]')).toThrow('TOML requires the top-level value to be an object');
    expect(() => jsonToToml('null')).toThrow('TOML requires the top-level value to be an object');
  });

  it('should escape special characters in strings', () => {
    const result = jsonToToml('{"path":"C:\\\\Users\\\\test"}');
    expect(result.output).toContain('"C:\\\\Users\\\\test"');
  });

  it('should handle keys with special characters', () => {
    const result = jsonToToml('{"key with spaces":"value"}');
    expect(result.output).toContain('"key with spaces"');
  });

  it('should handle empty arrays of primitives', () => {
    const result = jsonToToml('{"items":[]}');
    expect(result.output).toContain('items = []');
  });

  it('should separate table sections with blank lines', () => {
    const result = jsonToToml('{"a":{"x":1},"b":{"y":2}}');
    expect(result.output).toContain('\n\n');
  });
});
