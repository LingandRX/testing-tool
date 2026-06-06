/**
 * 业务数据生成器
 * 包含：订单号、价格、日期、状态、数量、评分、折扣、库存
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
 * 格式化日期
 */
function formatDate(date: Date, format: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 订单号生成器
 */
export const orderId: GeneratorDefinition = {
  id: 'orderId',
  name: '订单号',
  description: '生成随机订单号',
  categoryId: 'business',
  params: [
    {
      key: 'prefix',
      label: '前缀',
      type: 'string',
      defaultValue: 'ORD',
      description: '订单号前缀',
      placeholder: '请输入前缀',
    },
    {
      key: 'length',
      label: '数字长度',
      type: 'number',
      defaultValue: 10,
      min: 6,
      max: 20,
      description: '订单号数字部分长度',
    },
  ],
  generate: (params) => {
    const prefix = (params.prefix as string) || 'ORD';
    const length = (params.length as number) || 10;
    const maxNum = Math.pow(10, length) - 1;
    const num = String(randomInt(0, maxNum)).padStart(length, '0');
    return `${prefix}${num}`;
  },
  generateAtIndex: (params, index) => {
    const prefix = (params.prefix as string) || 'ORD';
    const length = (params.length as number) || 10;
    const num = String(index + 1).padStart(length, '0');
    return `${prefix}${num}`;
  },
};

/**
 * 价格生成器
 */
export const price: GeneratorDefinition = {
  id: 'price',
  name: '价格',
  description: '生成随机价格',
  categoryId: 'business',
  params: [
    {
      key: 'min',
      label: '最低价格',
      type: 'number',
      defaultValue: 1,
      min: 0,
      description: '价格最小值',
    },
    {
      key: 'max',
      label: '最高价格',
      type: 'number',
      defaultValue: 1000,
      min: 0,
      description: '价格最大值',
    },
    {
      key: 'decimals',
      label: '小数位数',
      type: 'number',
      defaultValue: 2,
      min: 0,
      max: 4,
      description: '价格小数位数',
    },
    {
      key: 'strategy',
      label: '生成策略',
      type: 'select',
      defaultValue: 'random',
      description: '价格生成策略',
      options: [
        { label: '随机', value: 'random' },
        { label: '心理定价', value: 'psychological' },
        { label: '真实分布', value: 'realistic' },
      ],
    },
    {
      key: 'currency',
      label: '货币符号',
      type: 'string',
      defaultValue: '¥',
      description: '货币符号',
    },
  ],
  generate: (params) => {
    const min = (params.min as number) || 1;
    const max = (params.max as number) || 1000;
    const decimals = (params.decimals as number) ?? 2;
    const strategy = (params.strategy as string) || 'random';
    const currency = (params.currency as string) || '¥';

    let value: number;
    if (strategy === 'psychological') {
      value = generatePsychologicalPrice(min, max);
    } else if (strategy === 'realistic') {
      value = generateRealisticPrice(min, max);
    } else {
      value = min + Math.random() * (max - min);
    }

    return `${currency}${value.toFixed(decimals)}`;
  },
};

/**
 * 生成心理定价（如 9.99, 19.9, 99）
 */
function generatePsychologicalPrice(min: number, max: number): number {
  const patterns = [
    () => {
      const base = randomInt(Math.ceil(min), Math.floor(max / 10));
      return base * 10 - 0.01;
    },
    () => {
      const base = randomInt(Math.ceil(min / 10), Math.floor(max / 10));
      return base * 10 - 1;
    },
    () => {
      const base = randomInt(Math.ceil(min / 100), Math.floor(max / 100));
      return base * 100 - 1;
    },
  ];

  let price = randomPick(patterns)();
  if (price < min) price = min;
  if (price > max) price = max;
  return price;
}

/**
 * 生成真实分布价格（对数正态分布）
 */
function generateRealisticPrice(min: number, max: number): number {
  const mean = (Math.log(min) + Math.log(max)) / 2;
  const stdDev = (Math.log(max) - Math.log(min)) / 4;
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  const value = Math.exp(mean + num * stdDev);
  return Math.max(min, Math.min(max, value));
}

/**
 * 日期生成器
 */
export const date: GeneratorDefinition = {
  id: 'date',
  name: '日期',
  description: '生成随机日期',
  categoryId: 'business',
  params: [
    {
      key: 'startDate',
      label: '开始日期',
      type: 'string',
      defaultValue: '2020-01-01',
      description: '日期范围开始',
      placeholder: 'YYYY-MM-DD',
    },
    {
      key: 'endDate',
      label: '结束日期',
      type: 'string',
      defaultValue: '2025-12-31',
      description: '日期范围结束',
      placeholder: 'YYYY-MM-DD',
    },
    {
      key: 'format',
      label: '日期格式',
      type: 'select',
      defaultValue: 'YYYY-MM-DD',
      description: '输出格式',
      options: [
        { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
        { label: 'YYYY/MM/DD', value: 'YYYY/MM/DD' },
        { label: 'YYYY-MM-DD HH:mm:ss', value: 'YYYY-MM-DD HH:mm:ss' },
        { label: 'YYYY/MM/DD HH:mm:ss', value: 'YYYY/MM/DD HH:mm:ss' },
      ],
    },
  ],
  generate: (params) => {
    const startStr = (params.startDate as string) || '2020-01-01';
    const endStr = (params.endDate as string) || '2025-12-31';
    const format = (params.format as string) || 'YYYY-MM-DD';

    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    const randomTime = start + Math.random() * (end - start);
    const date = new Date(randomTime);

    return formatDate(date, format);
  },
};

/**
 * 状态生成器
 */
export const status: GeneratorDefinition = {
  id: 'status',
  name: '状态',
  description: '生成随机状态',
  categoryId: 'business',
  params: [
    {
      key: 'type',
      label: '状态类型',
      type: 'select',
      defaultValue: 'order',
      description: '选择状态类型',
      options: [
        { label: '订单状态', value: 'order' },
        { label: '用户状态', value: 'user' },
        { label: '审核状态', value: 'review' },
        { label: '支付状态', value: 'payment' },
        { label: '自定义', value: 'custom' },
      ],
    },
    {
      key: 'customValues',
      label: '自定义值',
      type: 'string',
      defaultValue: '',
      description: '自定义状态值，用逗号分隔',
      placeholder: '状态1,状态2,状态3',
    },
  ],
  generate: (params) => {
    const type = (params.type as string) || 'order';

    const statusMap: Record<string, string[]> = {
      order: ['待付款', '待发货', '已发货', '已完成', '已取消', '已退款'],
      user: ['活跃', '未激活', '已禁用', '已注销'],
      review: ['待审核', '审核中', '已通过', '已拒绝'],
      payment: ['待支付', '支付中', '支付成功', '支付失败', '已退款'],
    };

    if (type === 'custom') {
      const customValues = (params.customValues as string) || '';
      const values = customValues.split(',').filter((v) => v.trim());
      if (values.length > 0) {
        return randomPick(values);
      }
      return '未知状态';
    }

    return randomPick(statusMap[type] || statusMap.order);
  },
};

/**
 * 数量生成器
 */
export const quantity: GeneratorDefinition = {
  id: 'quantity',
  name: '数量',
  description: '生成随机数量',
  categoryId: 'business',
  params: [
    {
      key: 'min',
      label: '最小值',
      type: 'number',
      defaultValue: 1,
      min: 0,
      description: '数量最小值',
    },
    {
      key: 'max',
      label: '最大值',
      type: 'number',
      defaultValue: 100,
      min: 0,
      description: '数量最大值',
    },
    {
      key: 'distribution',
      label: '分布方式',
      type: 'select',
      defaultValue: 'uniform',
      description: '数量分布方式',
      options: [
        { label: '均匀分布', value: 'uniform' },
        { label: '泊松分布', value: 'poisson' },
      ],
    },
  ],
  generate: (params) => {
    const min = (params.min as number) || 1;
    const max = (params.max as number) || 100;
    const distribution = (params.distribution as string) || 'uniform';

    if (distribution === 'poisson') {
      return String(poissonRandom(Math.floor((min + max) / 2)));
    }
    return String(randomInt(min, max));
  },
};

/**
 * 泊松分布随机数
 */
function poissonRandom(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

/**
 * 评分生成器
 */
export const rating: GeneratorDefinition = {
  id: 'rating',
  name: '评分',
  description: '生成随机评分',
  categoryId: 'business',
  params: [
    {
      key: 'min',
      label: '最低分',
      type: 'number',
      defaultValue: 1,
      min: 0,
      max: 10,
      description: '评分最小值',
    },
    {
      key: 'max',
      label: '最高分',
      type: 'number',
      defaultValue: 5,
      min: 0,
      max: 10,
      description: '评分最大值',
    },
    {
      key: 'decimals',
      label: '小数位数',
      type: 'number',
      defaultValue: 1,
      min: 0,
      max: 2,
      description: '评分小数位数',
    },
    {
      key: 'skewed',
      label: '偏向高分',
      type: 'boolean',
      defaultValue: true,
      description: '是否偏向高分（模拟真实评分分布）',
    },
  ],
  generate: (params) => {
    const min = (params.min as number) || 1;
    const max = (params.max as number) || 5;
    const decimals = (params.decimals as number) ?? 1;
    const skewed = params.skewed !== false;

    if (skewed) {
      return skewedRandom(min, max).toFixed(decimals);
    }
    return (min + Math.random() * (max - min)).toFixed(decimals);
  },
};

/**
 * 偏向高分的随机数（模拟真实评分分布）
 */
function skewedRandom(min: number, max: number): number {
  // 使用 Beta 分布模拟评分偏向
  const alpha = 3;
  const beta = 1;
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const x = Math.pow(u, 1 / alpha) / Math.pow(u, 1 / alpha) + Math.pow(v, 1 / beta);
  return min + x * (max - min);
}

/**
 * 折扣生成器
 */
export const discount: GeneratorDefinition = {
  id: 'discount',
  name: '折扣',
  description: '生成随机折扣',
  categoryId: 'business',
  params: [
    {
      key: 'min',
      label: '最低折扣',
      type: 'number',
      defaultValue: 1,
      min: 0,
      max: 100,
      description: '折扣最小值（百分比）',
    },
    {
      key: 'max',
      label: '最高折扣',
      type: 'number',
      defaultValue: 50,
      min: 0,
      max: 100,
      description: '折扣最大值（百分比）',
    },
    {
      key: 'strategy',
      label: '生成策略',
      type: 'select',
      defaultValue: 'random',
      description: '折扣生成策略',
      options: [
        { label: '随机', value: 'random' },
        { label: '心理定价', value: 'psychological' },
      ],
    },
  ],
  generate: (params) => {
    const min = (params.min as number) || 1;
    const max = (params.max as number) || 50;
    const strategy = (params.strategy as string) || 'random';

    let discount: number;
    if (strategy === 'psychological') {
      discount = generatePsychologicalDiscount(min, max);
    } else {
      discount = randomInt(min, max);
    }
    return `${discount}%`;
  },
};

/**
 * 生成心理折扣（如 5%, 10%, 20%, 30%）
 */
function generatePsychologicalDiscount(min: number, max: number): number {
  const psychologicalDiscounts = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80];
  const validDiscounts = psychologicalDiscounts.filter((d) => d >= min && d <= max);
  if (validDiscounts.length > 0) {
    return randomPick(validDiscounts);
  }
  return randomInt(min, max);
}

/**
 * 库存生成器
 */
export const stock: GeneratorDefinition = {
  id: 'stock',
  name: '库存',
  description: '生成随机库存数量',
  categoryId: 'business',
  params: [
    {
      key: 'min',
      label: '最小库存',
      type: 'number',
      defaultValue: 0,
      min: 0,
      description: '库存最小值',
    },
    {
      key: 'max',
      label: '最大库存',
      type: 'number',
      defaultValue: 1000,
      min: 0,
      description: '库存最大值',
    },
    {
      key: 'allowZero',
      label: '允许为零',
      type: 'boolean',
      defaultValue: true,
      description: '是否允许库存为零',
    },
  ],
  generate: (params) => {
    const min = (params.min as number) || 0;
    const max = (params.max as number) || 1000;
    const allowZero = params.allowZero !== false;

    if (allowZero) {
      return String(randomInt(min, max));
    }
    return String(randomInt(Math.max(1, min), max));
  },
};

export const businessGenerators: GeneratorDefinition[] = [
  orderId,
  price,
  date,
  status,
  quantity,
  rating,
  discount,
  stock,
];
