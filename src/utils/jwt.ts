/**
 * JWT 解析工具
 */

import { getMessage } from '@/utils/chromeI18n';

interface JwtHeader {
  alg: string;
  typ?: string;
  [key: string]: unknown;
}

interface JwtPayload {
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
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

  const pad = base64.length % 4;
  if (pad) {
    if (pad === 1) {
      throw new Error(getMessage('jwt_errors_invalidBase64String'));
    }
    base64 += new Array(5 - pad).join('=');
  }

  try {
    const binStr = atob(base64);
    const binLen = binStr.length;
    const bytes = new Uint8Array(binLen);
    for (let i = 0; i < binLen; i++) {
      bytes[i] = binStr.charCodeAt(i);
    }
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
  } catch (e) {
    throw new Error(
      getMessage('jwt_errors_failedToDecode') + (e instanceof Error ? e.message : String(e)),
      { cause: e },
    );
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
      error: getMessage('jwt_errors_invalidFormat'),
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
    result.error =
      getMessage('jwt_errors_parseHeaderFailed') + (e instanceof Error ? e.message : String(e));
    return result;
  }

  try {
    const payloadJson = decodeBase64Url(payloadB64);
    result.payload = JSON.parse(payloadJson);
  } catch (e) {
    result.error =
      getMessage('jwt_errors_parsePayloadFailed') + (e instanceof Error ? e.message : String(e));
    return result;
  }

  return result;
}

/**
 * 将对象格式化为 JSON 字符串
 * @param obj 对象
 */
export function stringifyJson(obj: unknown): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    console.error('格式化 JSON 失败：', e);
    return String(obj);
  }
}
