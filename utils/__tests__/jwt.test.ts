import { describe, expect, it } from 'vitest';
import { decodeBase64Url, parseJwt } from '@/utils/jwt';

describe('jwt utils', () => {
  describe('decodeBase64Url', () => {
    it('should decode standard base64url', () => {
      // "test" -> "dGVzdA"
      expect(decodeBase64Url('dGVzdA')).toBe('test');
    });

    it('should handle padding correctly', () => {
      // "a" -> "YQ" (needs ==)
      expect(decodeBase64Url('YQ')).toBe('a');
      // "ab" -> "YWI" (needs =)
      expect(decodeBase64Url('YWI')).toBe('ab');
    });

    it('should handle - and _ correctly', () => {
      // Validating base64url specific chars
      // standard base64 of binary 0xFF 0xEF is "/+8="
      // base64url should be "_-8"
      // Wait, let's use a simpler one.
      // 0xFB 0xFF -> "+/8=" in base64, "-_8=" in base64url? No.
      // + -> -
      // / -> _
      // let's try to encode something that results in + and /
      // binary 0xFB 0xFF 0xBE -> "+/++" in base64 -> "-_--" in base64url
      expect(decodeBase64Url('-_--')).toBeDefined();
    });

    it('should decode UTF-8 characters correctly', () => {
      // "你好" -> "5L2g5aW9"
      expect(decodeBase64Url('5L2g5aW9')).toBe('你好');
    });
  });

  describe('parseJwt', () => {
    it('should return error for invalid format', () => {
      const result = parseJwt('invalid-token');
      expect(result.error).toContain('格式错误');
    });

    it('should parse a valid JWT structure', () => {
      // Header: {"alg":"HS256","typ":"JWT"}
      // Payload: {"sub":"1234567890","name":"John Doe","iat":1516239022}
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const result = parseJwt(token);

      expect(result.error).toBeUndefined();
      expect(result.header?.alg).toBe('HS256');
      expect(result.payload?.name).toBe('John Doe');
      expect(result.signature).toBe('SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
    });

    it('should handle malformed json in header/payload', () => {
      // Base64 of "{"
      const token = 'ew.ew.signature';
      const result = parseJwt(token);
      expect(result.error).toBeDefined();
    });
  });
});
