/**
 * 基础类型生成器
 * 包含：随机整数、随机浮点数、随机字符串、从列表选择
 */

import type { GeneratorDefinition } from '@/types/testDataGenerator';

/**
 * 生成随机整数
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 从数组中随机选择
 */
function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 随机整数生成器
 */
export const randomIntGenerator: GeneratorDefinition = {
  id: 'randomInt',
  name: '随机整数',
  description: '生成指定范围内的随机整数',
  categoryId: 'basic',
  params: [
    {
      key: 'min',
      label: '最小值',
      type: 'number',
      defaultValue: 0,
      description: '整数最小值',
    },
    {
      key: 'max',
      label: '最大值',
      type: 'number',
      defaultValue: 100,
      description: '整数最大值',
    },
  ],
  generate: (params) => {
    const min = (params.min as number) || 0;
    const max = (params.max as number) || 100;
    return String(randomInt(min, max));
  },
  generateAtIndex: (params, index) => {
    const min = (params.min as number) || 0;
    const max = (params.max as number) || 100;
    const range = max - min + 1;
    return String(min + (index % range));
  },
};

/**
 * 随机浮点数生成器
 */
export const randomFloat: GeneratorDefinition = {
  id: 'randomFloat',
  name: '随机浮点数',
  description: '生成指定范围内的随机浮点数',
  categoryId: 'basic',
  params: [
    {
      key: 'min',
      label: '最小值',
      type: 'number',
      defaultValue: 0,
      description: '浮点数最小值',
    },
    {
      key: 'max',
      label: '最大值',
      type: 'number',
      defaultValue: 100,
      description: '浮点数最大值',
    },
    {
      key: 'decimals',
      label: '小数位数',
      type: 'number',
      defaultValue: 2,
      min: 0,
      max: 10,
      description: '小数位数',
    },
  ],
  generate: (params) => {
    const min = (params.min as number) || 0;
    const max = (params.max as number) || 100;
    const decimals = (params.decimals as number) ?? 2;
    const value = min + Math.random() * (max - min);
    return value.toFixed(decimals);
  },
};

/**
 * 随机字符串生成器
 */
export const randomString: GeneratorDefinition = {
  id: 'randomString',
  name: '随机字符串',
  description: '生成指定长度的随机字符串',
  categoryId: 'basic',
  params: [
    {
      key: 'length',
      label: '字符串长度',
      type: 'number',
      defaultValue: 10,
      min: 1,
      max: 100,
      description: '字符串长度',
    },
    {
      key: 'charset',
      label: '字符集',
      type: 'select',
      defaultValue: 'alphanumeric',
      description: '使用的字符集',
      options: [
        { label: '字母数字', value: 'alphanumeric' },
        { label: '仅字母', value: 'alpha' },
        { label: '仅数字', value: 'numeric' },
        { label: '小写字母', value: 'lowercase' },
        { label: '大写字母', value: 'uppercase' },
        { label: '十六进制', value: 'hex' },
        { label: 'Base64', value: 'base64' },
      ],
    },
  ],
  generate: (params) => {
    const length = (params.length as number) || 10;
    const charset = (params.charset as string) || 'alphanumeric';

    const charsets: Record<string, string> = {
      alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
      numeric: '0123456789',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      hex: '0123456789abcdef',
      base64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
    };

    const chars = charsets[charset] || charsets.alphanumeric;
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  generateAtIndex: (params, index) => {
    const length = (params.length as number) || 10;
    const charset = (params.charset as string) || 'alphanumeric';

    const charsets: Record<string, string> = {
      alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
      numeric: '0123456789',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      hex: '0123456789abcdef',
      base64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
    };

    const chars = charsets[charset] || charsets.alphanumeric;
    const base = String(index).padStart(length, '0');
    let result = '';
    for (let i = 0; i < length; i++) {
      const charIndex = parseInt(base[i]) || 0;
      result += chars[charIndex % chars.length];
    }
    return result;
  },
};

/**
 * 从列表选择生成器
 */
export const fromList: GeneratorDefinition = {
  id: 'fromList',
  name: '从列表选择',
  description: '从自定义列表中随机选择',
  categoryId: 'basic',
  params: [
    {
      key: 'values',
      label: '列表值',
      type: 'string',
      defaultValue: '',
      description: '列表值，用逗号分隔',
      placeholder: '值1,值2,值3',
    },
    {
      key: 'allowDuplicate',
      label: '允许重复',
      type: 'boolean',
      defaultValue: true,
      description: '是否允许重复选择',
    },
  ],
  generate: (params) => {
    const valuesStr = (params.values as string) || '';
    const values = valuesStr
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v);

    if (values.length === 0) {
      return '（请配置列表值）';
    }

    return randomPick(values);
  },
};

export const basicGenerators: GeneratorDefinition[] = [
  randomIntGenerator,
  randomFloat,
  randomString,
  fromList,
];
