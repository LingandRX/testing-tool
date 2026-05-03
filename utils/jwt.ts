/**
 * JWT 解析工具
 */

export interface JwtHeader {
  alg: string;
  typ?: string;
  [key: string]: unknown;
}

export interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: unknown;
}

export interface JwtResult {
  header: JwtHeader | null;
  payload: JwtPayload | null;
  signature: string;
  raw: {
    header: string;
    payload: string;
    signature: string;
  };
  error?: string;
}

/**
 * Base64URL 解码
 * @param str Base64URL 编码字符串
 */
export function decodeBase64Url(str: string): string {
  // 将 Base64URL 转换为 标准 Base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

  // 添加填充
  const pad = base64.length % 4;
  if (pad) {
    if (pad === 1) {
      throw new Error('Invalid base64url string');
    }
    base64 += new Array(5 - pad).join('=');
  }

  try {
    // 使用 TextDecoder 处理 UTF-8 字符
    const binStr = atob(base64);
    const binLen = binStr.length;
    const bytes = new Uint8Array(binLen);
    for (let i = 0; i < binLen; i++) {
      bytes[i] = binStr.charCodeAt(i);
    }
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
  } catch (e) {
    throw new Error('Failed to decode base64url: ' + (e instanceof Error ? e.message : String(e)));
  }
}

/**
 * 解析 JWT 字符串
 * @param token JWT 字符串
 */
export function parseJwt(token: string): JwtResult {
  const parts = token.trim().split('.');

  if (parts.length !== 3) {
    return {
      header: null,
      payload: null,
      signature: '',
      raw: { header: '', payload: '', signature: '' },
      error: 'JWT 格式错误：必须包含三个由 "." 分隔的部分',
    };
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const result: JwtResult = {
    header: null,
    payload: null,
    signature: signatureB64,
    raw: {
      header: headerB64,
      payload: payloadB64,
      signature: signatureB64,
    },
  };

  try {
    const headerJson = decodeBase64Url(headerB64);
    result.header = JSON.parse(headerJson);
  } catch (e) {
    result.error = '解析 Header 失败：' + (e instanceof Error ? e.message : String(e));
    return result;
  }

  try {
    const payloadJson = decodeBase64Url(payloadB64);
    result.payload = JSON.parse(payloadJson);
  } catch (e) {
    result.error = '解析 Payload 失败：' + (e instanceof Error ? e.message : String(e));
    return result;
  }

  return result;
}

/**
 * 格式化 JSON
 * @param obj 对象
 */
export function formatJson(obj: unknown): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    console.error('格式化 JSON 失败：', e);
    return String(obj);
  }
}
