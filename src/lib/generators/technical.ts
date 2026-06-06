/**
 * 技术数据生成器
 * 包含：UUID、IPv4、URL
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
 * UUID 生成器
 */
export const uuid: GeneratorDefinition = {
  id: 'uuid',
  name: 'UUID',
  description: '生成随机 UUID',
  categoryId: 'technical',
  params: [
    {
      key: 'version',
      label: 'UUID 版本',
      type: 'select',
      defaultValue: 'v4',
      description: 'UUID 版本',
      options: [
        { label: 'v4 (随机)', value: 'v4' },
        { label: 'v1 (时间戳)', value: 'v1' },
      ],
    },
    {
      key: 'uppercase',
      label: '大写字母',
      type: 'boolean',
      defaultValue: false,
      description: '是否使用大写字母',
    },
    {
      key: 'noDashes',
      label: '无连字符',
      type: 'boolean',
      defaultValue: false,
      description: '是否省略连字符',
    },
  ],
  generate: (params) => {
    const version = (params.version as string) || 'v4';
    const uppercase = params.uppercase === true;
    const noDashes = params.noDashes === true;

    let result: string;
    if (version === 'v1') {
      result = generateUUIDv1();
    } else {
      result = generateUUIDv4();
    }

    if (uppercase) {
      result = result.toUpperCase();
    }

    if (noDashes) {
      result = result.replace(/-/g, '');
    }

    return result;
  },
};

/**
 * 生成 UUID v4
 */
function generateUUIDv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 生成 UUID v1（简化版本，模拟时间戳）
 */
function generateUUIDv1(): string {
  const now = Date.now();
  const timeLow = (now & 0xffffffff).toString(16).padStart(8, '0');
  const timeMid = ((now >> 32) & 0xffff).toString(16).padStart(4, '0');
  const timeHi = ((now >> 48) & 0x0fff) | 0x1000;
  const clockSeq = randomInt(0, 0x3fff) | 0x8000;
  const node = Array.from({ length: 6 }, () =>
    randomInt(0, 255).toString(16).padStart(2, '0'),
  ).join('');

  return `${timeLow}-${timeMid}-${timeHi.toString(16)}-${clockSeq.toString(16)}-${node}`;
}

/**
 * IPv4 生成器
 */
export const ipv4: GeneratorDefinition = {
  id: 'ipv4',
  name: 'IPv4',
  description: '生成随机 IPv4 地址',
  categoryId: 'technical',
  params: [
    {
      key: 'type',
      label: '地址类型',
      type: 'select',
      defaultValue: 'random',
      description: 'IP 地址类型',
      options: [
        { label: '完全随机', value: 'random' },
        { label: '内网地址', value: 'private' },
        { label: '公网地址', value: 'public' },
        { label: '环回地址', value: 'loopback' },
      ],
    },
  ],
  generate: (params) => {
    const type = (params.type as string) || 'random';

    if (type === 'private') {
      return generatePrivateIPv4();
    } else if (type === 'loopback') {
      return '127.0.0.1';
    } else if (type === 'public') {
      return generatePublicIPv4();
    }
    return generateRandomIPv4();
  },
};

/**
 * 生成完全随机 IPv4
 */
function generateRandomIPv4(): string {
  return Array.from({ length: 4 }, () => randomInt(0, 255)).join('.');
}

/**
 * 生成内网 IPv4
 */
function generatePrivateIPv4(): string {
  const ranges = [
    { prefix: '10', second: () => randomInt(0, 255) },
    { prefix: '172', second: () => randomInt(16, 31) },
    { prefix: '192.168', second: () => randomInt(0, 255) },
  ];
  const range = randomPick(ranges);

  if (range.prefix === '192.168') {
    return `192.168.${range.second()}.${randomInt(1, 254)}`;
  }
  return `${range.prefix}.${range.second()}.${randomInt(1, 254)}.${randomInt(1, 254)}`;
}

/**
 * 生成公网 IPv4
 */
function generatePublicIPv4(): string {
  let first: number;
  do {
    first = randomInt(1, 255);
  } while (first === 10 || first === 127 || first === 192 || first === 172);

  return `${first}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`;
}

/**
 * URL 生成器
 */
export const url: GeneratorDefinition = {
  id: 'url',
  name: 'URL',
  description: '生成随机 URL',
  categoryId: 'technical',
  params: [
    {
      key: 'protocol',
      label: '协议',
      type: 'select',
      defaultValue: 'https',
      description: 'URL 协议',
      options: [
        { label: 'HTTPS', value: 'https' },
        { label: 'HTTP', value: 'http' },
        { label: '随机', value: 'random' },
      ],
    },
    {
      key: 'type',
      label: 'URL 类型',
      type: 'select',
      defaultValue: 'website',
      description: 'URL 类型',
      options: [
        { label: '网站', value: 'website' },
        { label: 'API', value: 'api' },
        { label: '图片', value: 'image' },
        { label: '文件', value: 'file' },
      ],
    },
    {
      key: 'includePath',
      label: '包含路径',
      type: 'boolean',
      defaultValue: true,
      description: '是否包含路径',
    },
  ],
  generate: (params) => {
    const protocol = (params.protocol as string) || 'https';
    const type = (params.type as string) || 'website';
    const includePath = params.includePath !== false;

    const actualProtocol = protocol === 'random' ? randomPick(['http', 'https']) : protocol;

    const domains = [
      'example.com',
      'test.org',
      'demo.net',
      'sample.io',
      'api.service.com',
      'cdn.static.com',
      'img.media.com',
    ];
    const domain = randomPick(domains);

    let path = '';
    if (includePath) {
      if (type === 'api') {
        path = `/api/v${randomInt(1, 3)}/${randomPick(['users', 'products', 'orders', 'items'])}`;
      } else if (type === 'image') {
        path = `/images/${randomPick(['avatar', 'banner', 'logo', 'photo'])}/${randomInt(1, 1000)}.jpg`;
      } else if (type === 'file') {
        path = `/files/${randomPick(['document', 'report', 'data'])}/${randomInt(1, 100)}.pdf`;
      } else {
        path = `/${randomPick(['about', 'contact', 'products', 'services', 'blog'])}`;
      }
    }

    // 添加查询参数
    let query = '';
    if (Math.random() > 0.5) {
      const params = new URLSearchParams();
      params.set('id', String(randomInt(1, 10000)));
      if (Math.random() > 0.5) params.set('page', String(randomInt(1, 100)));
      if (Math.random() > 0.7) params.set('lang', randomPick(['zh', 'en', 'ja']));
      query = `?${params.toString()}`;
    }

    return `${actualProtocol}://${domain}${path}${query}`;
  },
};

export const technicalGenerators: GeneratorDefinition[] = [uuid, ipv4, url];
