# 技术实现

## 技术栈

| 技术         | 用途     | 版本 |
| ------------ | -------- | ---- |
| React        | UI 框架  | 19.x |
| TypeScript   | 类型系统 | 5.x  |
| Tailwind CSS | 样式     | 3.x  |
| Web Worker   | 后台生成 | -    |
| localStorage | 本地存储 | -    |

---

## 项目结构

```
src/pages/TestDataGenerator/
├── index.tsx                    # 主页面
├── components/
│   ├── FieldList.tsx            # 字段列表
│   ├── FieldItem.tsx            # 单个字段项
│   ├── FieldEditor.tsx          # 字段编辑器
│   ├── GeneratorSelector.tsx    # 生成器选择器
│   ├── GeneratorConfig.tsx      # 参数配置
│   ├── DataPreview.tsx          # 数据预览
│   ├── GenerateOptions.tsx      # 生成选项
│   ├── GenerateButton.tsx       # 生成按钮
│   ├── ExportPanel.tsx          # 导出面板
│   └── RuleManager.tsx          # 规则管理
├── generators/
│   ├── index.ts                 # 生成器入口
│   ├── personal.ts              # 个人信息生成器
│   ├── business.ts              # 业务数据生成器
│   ├── technical.ts             # 技术数据生成器
│   └── basic.ts                 # 基础类型生成器
├── storage/
│   ├── ruleStorage.ts           # 规则存储
│   └── index.ts                 # 存储入口
├── worker/
│   └── generator.worker.ts      # Web Worker
├── types/
│   └── index.ts                 # 类型定义
└── utils/
    ├── validator.ts             # 规则校验
    ├── exporter.ts              # 数据导出
    └── helpers.ts               # 工具函数
```

---

## 类型定义

### 核心类型

```typescript
// 字段配置
export interface FieldConfig {
  id: string;
  name: string;
  generator: string;
  params: Record<string, any>;
  unique: boolean;
  required: boolean; // 是否必填
  emptyRate?: number; // 选填字段的空值概率（0-100），仅当 required=false 时生效
}

// 规则配置
export interface DataRule {
  id: string;
  name: string;
  description?: string;
  fields: FieldConfig[];
  options: {
    total: number;
    format: 'json' | 'csv' | 'sql' | 'typescript';
    defaultEmptyRate: number; // 默认空值率（0-100），用于未设置 emptyRate 的选填字段
  };
  metadata: {
    createdAt: number;
    updatedAt: number;
    lastUsedAt?: number;
    useCount: number;
  };
}

// 生成器定义
export interface GeneratorDefinition {
  name: string;
  label: string;
  description: string;
  category: 'personal' | 'business' | 'technical' | 'basic';
  icon: string;
  params: GeneratorParam[];
  // 普通生成方法
  generate: (params: Record<string, any>) => any;
  // 索引生成方法（可选，用于大数据量唯一性生成）
  generateAtIndex?: (params: Record<string, any>, index: number) => any;
}

// 生成器参数
export interface GeneratorParam {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'array';
  required: boolean;
  default?: any;
  options?: { label: string; value: any }[];
}

// 生成结果
export interface GenerateResult {
  success: boolean;
  data: any[];
  errors?: string[];
  stats: {
    total: number;
    generated: number;
    failed: number;
    duration: number;
  };
}
```

---

## 核心模块

### 1. 生成器系统

```typescript
// generators/index.ts
import { personalGenerators } from './personal';
import { businessGenerators } from './business';
import { technicalGenerators } from './technical';
import { basicGenerators } from './basic';

export const generators = {
  ...personalGenerators,
  ...businessGenerators,
  ...technicalGenerators,
  ...basicGenerators,
};

export const generatorCategories = [
  {
    key: 'personal',
    label: '个人信息',
    generators: ['chineseName', 'email', 'chinesePhone', 'idCard', 'chineseAddress'],
  },
  {
    key: 'business',
    label: '业务数据',
    generators: ['orderId', 'price', 'date', 'status'],
  },
  {
    key: 'technical',
    label: '技术数据',
    generators: ['uuid', 'ipv4', 'url'],
  },
  {
    key: 'basic',
    label: '基础类型',
    generators: ['randomInt', 'randomFloat', 'randomString', 'fromList'],
  },
];
```

### 2. 生成器实现

```typescript
// generators/personal.ts
export const personalGenerators = {
  chineseName: {
    name: 'chineseName',
    label: '中文姓名',
    description: '生成中文姓名，如张三、李四',
    icon: '👤',
    params: [
      {
        name: 'surnamePool',
        label: '姓氏池',
        type: 'string',
        required: false,
        default: '百家姓前100',
      },
      {
        name: 'givenNameLength',
        label: '名字长度',
        type: 'object',
        required: false,
        default: { min: 1, max: 2 },
      },
    ],
    generate: (params: any) => {
      const surnames =
        '王李张刘陈杨赵黄周吴徐孙胡朱高林何郭马罗梁宋郑谢韩唐冯于董萧程曹袁邓许傅沈曾彭吕苏卢蒋蔡贾丁魏薛叶阎余潘杜戴夏钟汪田任姜范方石姚谭廖邹熊金陆郝孔白崔康毛邱秦江史顾侯邵孟龙万段雷钱汤尹黎易常武乔贺赖龚文';
      const givenNames =
        '伟芳娜秀英敏静丽强磊洋勇艳杰娟涛超明华雪飞平刚慧建华玲桂英旭峰辉志强建平婷欣怡梦琪雅琴晓红';

      const surname = surnames[Math.floor(Math.random() * surnames.length)];
      const { min, max } = params.givenNameLength || { min: 1, max: 2 };
      const length = Math.floor(Math.random() * (max - min + 1)) + min;

      let givenName = '';
      for (let i = 0; i < length; i++) {
        givenName += givenNames[Math.floor(Math.random() * givenNames.length)];
      }

      return surname + givenName;
    },
    // 索引生成（唯一性保证）
    generateAtIndex: (params: any, index: number) => {
      const surnames =
        '王李张刘陈杨赵黄周吴徐孙胡朱高林何郭马罗梁宋郑谢韩唐冯于董萧程曹袁邓许傅沈曾彭吕苏卢蒋蔡贾丁魏薛叶阎余潘杜戴夏钟汪田任姜范方石姚谭廖邹熊金陆郝孔白崔康毛邱秦江史顾侯邵孟龙万段雷钱汤尹黎易常武乔贺赖龚文';
      const givenNames =
        '伟芳娜秀英敏静丽强磊洋勇艳杰娟涛超明华雪飞平刚慧建华玲桂英旭峰辉志强建平婷欣怡梦琪雅琴晓红';

      const surname = surnames[index % surnames.length];
      const givenName = givenNames[index % givenNames.length];

      return surname + givenName;
    },
  },

  email: {
    name: 'email',
    label: '邮箱地址',
    description: '生成邮箱地址',
    icon: '📧',
    params: [
      {
        name: 'domains',
        label: '域名列表',
        type: 'array',
        required: false,
        default: ['qq.com', '163.com', '126.com', 'gmail.com', 'outlook.com'],
      },
    ],
    generate: (params: any) => {
      const domains = params.domains || ['qq.com', '163.com'];
      const domain = domains[Math.floor(Math.random() * domains.length)];

      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let localPart = '';
      const length = 6 + Math.floor(Math.random() * 6);

      for (let i = 0; i < length; i++) {
        localPart += chars[Math.floor(Math.random() * chars.length)];
      }

      return `${localPart}@${domain}`;
    },
    // 索引生成（唯一性保证）
    generateAtIndex: (params: any, index: number) => {
      const domains = params.domains || ['qq.com', '163.com'];
      const domain = domains[index % domains.length];

      // 使用索引生成唯一用户名
      const localPart = `user${String(index).padStart(6, '0')}`;

      return `${localPart}@${domain}`;
    },
  },

  chinesePhone: {
    name: 'chinesePhone',
    label: '中国手机号',
    description: '生成11位中国手机号',
    icon: '📱',
    params: [
      {
        name: 'prefix',
        label: '手机号前缀',
        type: 'array',
        required: false,
        default: [
          '130',
          '131',
          '132',
          '133',
          '134',
          '135',
          '136',
          '137',
          '138',
          '139',
          '150',
          '151',
          '152',
          '153',
          '155',
          '156',
          '157',
          '158',
          '159',
          '180',
          '181',
          '182',
          '183',
          '184',
          '185',
          '186',
          '187',
          '188',
          '189',
        ],
      },
    ],
    // 普通生成（随机）
    generate: (params: any) => {
      const prefixes = params.prefix || ['138', '139', '150', '151'];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

      let suffix = '';
      for (let i = 0; i < 8; i++) {
        suffix += Math.floor(Math.random() * 10);
      }

      return prefix + suffix;
    },
    // 索引生成（唯一性保证）
    generateAtIndex: (params: any, index: number) => {
      const prefixes = params.prefix || ['138', '139', '150', '151'];
      const prefix = prefixes[index % prefixes.length];

      // 使用索引生成唯一后缀
      const suffix = String(10000000 + index).slice(-8);

      return prefix + suffix;
    },
  },

  age: {
    name: 'age',
    label: '年龄',
    description: '生成真实分布的年龄',
    icon: '🎂',
    params: [
      {
        name: 'min',
        label: '最小年龄',
        type: 'number',
        required: false,
        default: 1,
      },
      {
        name: 'max',
        label: '最大年龄',
        type: 'number',
        required: false,
        default: 100,
      },
      {
        name: 'strategy',
        label: '生成策略',
        type: 'select',
        required: false,
        default: 'realistic',
        options: [
          { label: '真实分布（推荐）', value: 'realistic' },
          { label: '均匀随机', value: 'uniform' },
          { label: '人口比例', value: 'demographic' },
        ],
      },
    ],
    generate: (params: any) => {
      const { min = 1, max = 100, strategy = 'realistic' } = params;
      let value: number;

      switch (strategy) {
        case 'realistic':
          // 正态分布：均值 35，标准差 10
          value = normalRandom(35, 10);
          break;
        case 'demographic':
          // 人口比例分布：年轻人多，老年人少
          value = demographicRandom(min, max);
          break;
        default:
          // 均匀分布
          value = Math.random() * (max - min) + min;
      }

      return Math.round(Math.max(min, Math.min(max, value)));
    },
    generateAtIndex: (params: any, index: number) => {
      const { min = 1, max = 100 } = params;
      const step = (max - min) / 10000;
      return Math.round(min + step * index);
    },
  },
};
```

```typescript
// generators/business.ts
export const businessGenerators = {
  price: {
    name: 'price',
    label: '价格',
    description: '生成真实的价格数据',
    icon: '💰',
    params: [
      {
        name: 'min',
        label: '最低价',
        type: 'number',
        required: true,
        default: 1,
      },
      {
        name: 'max',
        label: '最高价',
        type: 'number',
        required: true,
        default: 9999,
      },
      {
        name: 'decimals',
        label: '小数位数',
        type: 'select',
        required: false,
        default: 2,
        options: [
          { label: '0 位（整数）', value: 0 },
          { label: '1 位', value: 1 },
          { label: '2 位（常见）', value: 2 },
        ],
      },
      {
        name: 'strategy',
        label: '生成策略',
        type: 'select',
        required: false,
        default: 'realistic',
        options: [
          { label: '真实分布（推荐）', value: 'realistic' },
          { label: '均匀随机', value: 'uniform' },
          { label: '心理定价', value: 'psychological' },
        ],
      },
    ],
    // 普通生成（随机）
    generate: (params: any) => {
      const { min = 1, max = 9999, decimals = 2, strategy = 'realistic' } = params;
      let value: number;

      switch (strategy) {
        case 'psychological':
          // 心理定价：.99, .98, .95 结尾
          value = generatePsychologicalPrice(min, max);
          break;
        case 'realistic':
          // 真实分布：对数正态分布
          value = generateRealisticPrice(min, max);
          break;
        default:
          // 均匀分布
          value = Math.random() * (max - min) + min;
      }

      return parseFloat(value.toFixed(decimals));
    },
    // 索引生成（唯一性保证）
    generateAtIndex: (params: any, index: number) => {
      const { min = 1, max = 9999, decimals = 2, strategy = 'realistic' } = params;
      let value: number;

      // 索引生成时使用均匀分布，保证唯一性
      const step = (max - min) / 10000;
      value = min + step * index;

      // 确保在区间内
      value = Math.max(min, Math.min(max, value));

      return parseFloat(value.toFixed(decimals));
    },
  },

  orderId: {
    name: 'orderId',
    label: '订单号',
    description: '生成订单号',
    icon: '📋',
    params: [
      {
        name: 'prefix',
        label: '前缀',
        type: 'string',
        required: false,
        default: 'ORD',
      },
      {
        name: 'length',
        label: '编号长度',
        type: 'number',
        required: false,
        default: 12,
      },
    ],
    generate: (params: any) => {
      const prefix = params.prefix || 'ORD';
      const length = params.length || 12;
      let suffix = '';
      for (let i = 0; i < length; i++) {
        suffix += Math.floor(Math.random() * 10);
      }
      return `${prefix}${suffix}`;
    },
    generateAtIndex: (params: any, index: number) => {
      const prefix = params.prefix || 'ORD';
      const length = params.length || 12;
      const suffix = String(index).padStart(length, '0');
      return `${prefix}${suffix}`;
    },
  },

  date: {
    name: 'date',
    label: '日期',
    description: '生成随机日期',
    icon: '📅',
    params: [
      {
        name: 'start',
        label: '开始日期',
        type: 'string',
        required: false,
        default: '2020-01-01',
      },
      {
        name: 'end',
        label: '结束日期',
        type: 'string',
        required: false,
        default: '2024-12-31',
      },
      {
        name: 'format',
        label: '日期格式',
        type: 'select',
        required: false,
        default: 'YYYY-MM-DD',
        options: [
          { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
          { label: 'YYYY/MM/DD', value: 'YYYY/MM/DD' },
          { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
          { label: '时间戳', value: 'timestamp' },
        ],
      },
    ],
    generate: (params: any) => {
      const start = new Date(params.start || '2020-01-01').getTime();
      const end = new Date(params.end || '2024-12-31').getTime();
      const timestamp = start + Math.random() * (end - start);
      return formatDate(new Date(timestamp), params.format || 'YYYY-MM-DD');
    },
    generateAtIndex: (params: any, index: number) => {
      const start = new Date(params.start || '2020-01-01').getTime();
      const end = new Date(params.end || '2024-12-31').getTime();
      const step = (end - start) / 10000;
      const timestamp = start + step * index;
      return formatDate(new Date(timestamp), params.format || 'YYYY-MM-DD');
    },
  },

  status: {
    name: 'status',
    label: '状态',
    description: '生成随机状态',
    icon: '🔄',
    params: [
      {
        name: 'options',
        label: '状态选项',
        type: 'array',
        required: false,
        default: ['待处理', '处理中', '已完成', '已取消'],
      },
    ],
    generate: (params: any) => {
      const options = params.options || ['待处理', '处理中', '已完成', '已取消'];
      return options[Math.floor(Math.random() * options.length)];
    },
    generateAtIndex: (params: any, index: number) => {
      const options = params.options || ['待处理', '处理中', '已完成', '已取消'];
      return options[index % options.length];
    },
  },

  quantity: {
    name: 'quantity',
    label: '数量',
    description: '生成真实分布的数量',
    icon: '📦',
    params: [
      {
        name: 'min',
        label: '最小值',
        type: 'number',
        required: false,
        default: 1,
      },
      {
        name: 'max',
        label: '最大值',
        type: 'number',
        required: false,
        default: 100,
      },
      {
        name: 'strategy',
        label: '生成策略',
        type: 'select',
        required: false,
        default: 'realistic',
        options: [
          { label: '真实分布（推荐）', value: 'realistic' },
          { label: '批发模式', value: 'bulk' },
          { label: '均匀随机', value: 'uniform' },
        ],
      },
    ],
    generate: (params: any) => {
      const { min = 1, max = 100, strategy = 'realistic' } = params;
      let value: number;

      switch (strategy) {
        case 'bulk':
          // 批发模式：10-100 之间均匀分布
          value = Math.random() * 90 + 10;
          break;
        case 'realistic':
          // 泊松分布：大多数购买 1-3 件
          value = poissonRandom(2);
          break;
        default:
          // 均匀分布
          value = Math.random() * (max - min) + min;
      }

      return Math.round(Math.max(min, Math.min(max, value)));
    },
    generateAtIndex: (params: any, index: number) => {
      const { min = 1, max = 100 } = params;
      const step = (max - min) / 10000;
      return Math.round(min + step * index);
    },
  },

  rating: {
    name: 'rating',
    label: '评分',
    description: '生成真实分布的评分',
    icon: '⭐',
    params: [
      {
        name: 'min',
        label: '最低分',
        type: 'number',
        required: false,
        default: 1,
      },
      {
        name: 'max',
        label: '最高分',
        type: 'number',
        required: false,
        default: 5,
      },
      {
        name: 'decimals',
        label: '小数位数',
        type: 'number',
        required: false,
        default: 1,
      },
      {
        name: 'strategy',
        label: '生成策略',
        type: 'select',
        required: false,
        default: 'realistic',
        options: [
          { label: '真实分布（推荐）', value: 'realistic' },
          { label: '严格评价', value: 'strict' },
          { label: '均匀随机', value: 'uniform' },
        ],
      },
    ],
    generate: (params: any) => {
      const { min = 1, max = 5, decimals = 1, strategy = 'realistic' } = params;
      let value: number;

      switch (strategy) {
        case 'strict':
          // 严格评价：偏向低分
          value = skewedRandom(min, max, 0.3);
          break;
        case 'realistic':
          // 真实分布：偏向高分（电商平台常见）
          value = skewedRandom(min, max, 0.7);
          break;
        default:
          // 均匀分布
          value = Math.random() * (max - min) + min;
      }

      return parseFloat(Math.max(min, Math.min(max, value)).toFixed(decimals));
    },
    generateAtIndex: (params: any, index: number) => {
      const { min = 1, max = 5, decimals = 1 } = params;
      const step = (max - min) / 10000;
      return parseFloat((min + step * index).toFixed(decimals));
    },
  },

  discount: {
    name: 'discount',
    label: '折扣',
    description: '生成真实分布的折扣',
    icon: '🏷️',
    params: [
      {
        name: 'min',
        label: '最低折扣',
        type: 'number',
        required: false,
        default: 0.1,
      },
      {
        name: 'max',
        label: '最高折扣',
        type: 'number',
        required: false,
        default: 0.9,
      },
      {
        name: 'strategy',
        label: '生成策略',
        type: 'select',
        required: false,
        default: 'psychological',
        options: [
          { label: '心理定价（推荐）', value: 'psychological' },
          { label: '清仓模式', value: 'clearance' },
          { label: '均匀随机', value: 'uniform' },
        ],
      },
    ],
    generate: (params: any) => {
      const { min = 0.1, max = 0.9, strategy = 'psychological' } = params;
      let value: number;

      switch (strategy) {
        case 'clearance':
          // 清仓模式：大折扣区间（3-7折）
          value = Math.random() * 0.4 + 0.3;
          break;
        case 'psychological':
          // 心理定价：常见折扣点
          value = generatePsychologicalDiscount(min, max);
          break;
        default:
          // 均匀分布
          value = Math.random() * (max - min) + min;
      }

      return parseFloat(Math.max(min, Math.min(max, value)).toFixed(2));
    },
    generateAtIndex: (params: any, index: number) => {
      const { min = 0.1, max = 0.9 } = params;
      const step = (max - min) / 10000;
      return parseFloat((min + step * index).toFixed(2));
    },
  },

  stock: {
    name: 'stock',
    label: '库存',
    description: '生成真实分布的库存',
    icon: '🏭',
    params: [
      {
        name: 'min',
        label: '最小库存',
        type: 'number',
        required: false,
        default: 0,
      },
      {
        name: 'max',
        label: '最大库存',
        type: 'number',
        required: false,
        default: 1000,
      },
      {
        name: 'strategy',
        label: '生成策略',
        type: 'select',
        required: false,
        default: 'realistic',
        options: [
          { label: '真实分布（推荐）', value: 'realistic' },
          { label: '热销商品', value: 'hot' },
          { label: '均匀随机', value: 'uniform' },
        ],
      },
    ],
    generate: (params: any) => {
      const { min = 0, max = 1000, strategy = 'realistic' } = params;
      let value: number;

      switch (strategy) {
        case 'hot':
          // 热销商品：低库存（0-50）
          value = Math.random() * 50;
          break;
        case 'realistic':
          // 真实分布：指数分布，大多数库存较少
          value = exponentialRandom(min, max);
          break;
        default:
          // 均匀分布
          value = Math.random() * (max - min) + min;
      }

      return Math.round(Math.max(min, Math.min(max, value)));
    },
    generateAtIndex: (params: any, index: number) => {
      const { min = 0, max = 1000 } = params;
      const step = (max - min) / 10000;
      return Math.round(min + step * index);
    },
  },
};

// 辅助函数：生成心理定价
function generatePsychologicalPrice(min: number, max: number): number {
  let price = Math.random() * (max - min) + min;

  const strategies = [
    (p: number) => Math.floor(p) + 0.99,
    (p: number) => Math.floor(p) + 0.98,
    (p: number) => Math.floor(p) + 0.95,
    (p: number) => Math.floor(p / 10) * 10 + 9.9,
  ];

  const strategy = strategies[Math.floor(Math.random() * strategies.length)];
  price = strategy(price);

  return Math.max(min, Math.min(max, price));
}

// 辅助函数：生成真实分布价格（对数正态分布）
function generateRealisticPrice(min: number, max: number): number {
  const mu = Math.log((min + max) / 2);
  const sigma = 0.5;

  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

  let value = Math.exp(mu + sigma * z);
  value = Math.max(min, Math.min(max, value));

  return value;
}

// 辅助函数：格式化日期
function formatDate(date: Date, format: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  if (format === 'timestamp') {
    return date.getTime().toString();
  }

  return format.replace('YYYY', year.toString()).replace('MM', month).replace('DD', day);
}

// 辅助函数：正态分布随机数
function normalRandom(mean: number, stddev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + stddev * z;
}

// 辅助函数：人口比例分布（模拟真实年龄分布）
function demographicRandom(min: number, max: number): number {
  // 中国人口年龄分布大致比例（简化版）
  const weights = [
    { age: 5, weight: 0.05 }, // 0-5岁
    { age: 15, weight: 0.12 }, // 6-15岁
    { age: 25, weight: 0.18 }, // 16-25岁
    { age: 35, weight: 0.2 }, // 26-35岁
    { age: 45, weight: 0.18 }, // 36-45岁
    { age: 55, weight: 0.15 }, // 46-55岁
    { age: 65, weight: 0.08 }, // 56-65岁
    { age: 80, weight: 0.04 }, // 66-80岁
  ];

  // 按权重随机选择年龄段
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  let random = Math.random() * totalWeight;

  for (const w of weights) {
    if (random <= w.weight) {
      // 在该年龄段内均匀分布
      const ageMin = Math.max(min, w.age - 10);
      const ageMax = Math.min(max, w.age);
      return Math.random() * (ageMax - ageMin) + ageMin;
    }
    random -= w.weight;
  }

  return Math.random() * (max - min) + min;
}

// 辅助函数：泊松分布随机数（模拟购买数量）
function poissonRandom(lambda: number): number {
  let L = Math.exp(-lambda);
  let k = 0;
  let p = 1;

  do {
    k++;
    p *= Math.random();
  } while (p > L);

  return k - 1;
}

// 辅助函数：偏态分布随机数（模拟评分）
function skewedRandom(min: number, max: number, skewness: number): number {
  // 使用 beta 分布的简化实现
  const u = Math.random();
  const v = Math.random();

  // 根据偏度调整
  let value;
  if (skewness > 0.5) {
    // 右偏（偏向高分）
    value = Math.pow(u, 1 - skewness) * (max - min) + min;
  } else {
    // 左偏（偏向低分）
    value = (1 - Math.pow(v, skewness)) * (max - min) + min;
  }

  return Math.max(min, Math.min(max, value));
}

// 辅助函数：指数分布随机数（模拟库存）
function exponentialRandom(min: number, max: number): number {
  const lambda = 0.5; // 指数分布参数
  const u = Math.random();
  const value = -Math.log(1 - u) / lambda;

  // 缩放到指定区间
  const normalized = value / 10; // 归一化
  return normalized * (max - min) + min;
}

// 辅助函数：生成心理定价折扣
function generatePsychologicalDiscount(min: number, max: number): number {
  // 常见折扣点：8折、85折、9折、95折
  const commonDiscounts = [0.8, 0.85, 0.9, 0.95, 0.7, 0.75];

  // 随机选择一个常见折扣，或生成随机折扣
  if (Math.random() < 0.7) {
    // 70% 概率使用常见折扣
    const discount = commonDiscounts[Math.floor(Math.random() * commonDiscounts.length)];
    return Math.max(min, Math.min(max, discount));
  } else {
    // 30% 概率生成随机折扣
    return Math.random() * (max - min) + min;
  }
}
```

### 3. 数据生成引擎

```typescript
// worker/generator.worker.ts
import { generators } from '../generators';

self.onmessage = function (e) {
  const { rule, batchSize } = e.data;
  const results = [];

  for (let i = 0; i < rule.fields.length; i++) {
    const field = rule.fields[i];
    const generator = generators[field.generator];

    if (!generator) {
      self.postMessage({
        type: 'error',
        field: field.name,
        error: `生成器 ${field.generator} 不存在`,
      });
      continue;
    }
  }

  // 生成数据
  const data = [];
  const usedValues: Record<string, Set<any>> = {};

  // 根据总数量决定策略
  const isLargeBatch = rule.options.total > 1000;

  for (let i = 0; i < rule.options.total; i++) {
    const record: Record<string, any> = {};

    for (const field of rule.fields) {
      const generator = generators[field.generator];

      // 判断是否需要生成数据
      const shouldGenerate =
        field.required || Math.random() * 100 >= (field.emptyRate ?? rule.options.defaultEmptyRate);

      if (!shouldGenerate) {
        record[field.name] = null;
        continue;
      }

      let value;

      if (field.unique && isLargeBatch) {
        // 策略1：大数据量 + 唯一性 → 索引生成（高性能）
        value = generator.generateAtIndex?.(field.params, i) ?? generator.generate(field.params);
      } else if (field.unique) {
        // 策略2：小数据量 + 唯一性 → 随机生成 + 重试
        let retryCount = 0;
        const maxRetry = 100;

        do {
          value = generator.generate(field.params);

          if (usedValues[field.name]?.has(value)) {
            retryCount++;
            value = undefined;
          }
        } while (value === undefined && retryCount < maxRetry);
      } else {
        // 策略3：非唯一性 → 普通生成
        value = generator.generate(field.params);
      }

      if (value !== undefined) {
        record[field.name] = value;

        if (field.unique) {
          if (!usedValues[field.name]) {
            usedValues[field.name] = new Set();
          }
          usedValues[field.name].add(value);
        }
      } else {
        record[field.name] = null;
      }
    }

    data.push(record);

    // 发送进度
    if (i % batchSize === 0) {
      self.postMessage({
        type: 'progress',
        current: i + 1,
        total: rule.options.total,
      });
    }
  }

  self.postMessage({
    type: 'complete',
    data,
  });
};
```

### 4. 规则存储

```typescript
// storage/ruleStorage.ts
import type { DataRule } from '../types';

const STORAGE_KEY = 'testDataGenerator_rules';

export class RuleStorage {
  // 获取所有规则
  getAll(): DataRule[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  // 获取单个规则
  getById(id: string): DataRule | null {
    const rules = this.getAll();
    return rules.find((r) => r.id === id) || null;
  }

  // 保存规则
  save(rule: Omit<DataRule, 'id' | 'metadata'>): DataRule {
    const rules = this.getAll();

    const newRule: DataRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        useCount: 0,
      },
    };

    rules.push(newRule);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));

    return newRule;
  }

  // 更新规则
  update(id: string, updates: Partial<DataRule>): DataRule | null {
    const rules = this.getAll();
    const index = rules.findIndex((r) => r.id === id);

    if (index === -1) return null;

    rules[index] = {
      ...rules[index],
      ...updates,
      metadata: {
        ...rules[index].metadata,
        updatedAt: Date.now(),
      },
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
    return rules[index];
  }

  // 删除规则
  delete(id: string): boolean {
    const rules = this.getAll();
    const filtered = rules.filter((r) => r.id !== id);

    if (filtered.length === rules.length) return false;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  // 记录使用
  recordUse(id: string): void {
    const rules = this.getAll();
    const rule = rules.find((r) => r.id === id);

    if (rule) {
      rule.metadata.lastUsedAt = Date.now();
      rule.metadata.useCount++;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
    }
  }

  // 搜索规则
  search(keyword: string): DataRule[] {
    const rules = this.getAll();
    const lowerKeyword = keyword.toLowerCase();

    return rules.filter(
      (r) =>
        r.name.toLowerCase().includes(lowerKeyword) ||
        r.description?.toLowerCase().includes(lowerKeyword),
    );
  }

  // 获取最近使用
  getRecent(limit: number = 10): DataRule[] {
    const rules = this.getAll();
    return rules
      .filter((r) => r.metadata.lastUsedAt)
      .sort((a, b) => b.metadata.lastUsedAt! - a.metadata.lastUsedAt!)
      .slice(0, limit);
  }

  // 导出规则
  export(ids: string[]): string {
    const rules = this.getAll();
    const selected = rules.filter((r) => ids.includes(r.id));

    return JSON.stringify(
      {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        rules: selected,
      },
      null,
      2,
    );
  }

  // 导入规则
  import(jsonString: string): { success: number; failed: number; errors: string[] } {
    try {
      const data = JSON.parse(jsonString);

      if (!data.rules || !Array.isArray(data.rules)) {
        return { success: 0, failed: 1, errors: ['无效的规则格式'] };
      }

      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const rule of data.rules) {
        try {
          if (!this.validateRule(rule)) {
            throw new Error('规则格式不完整');
          }

          const newRule = {
            ...rule,
            id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            metadata: {
              ...rule.metadata,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          };

          const rules = this.getAll();
          rules.push(newRule);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));

          success++;
        } catch (e: any) {
          failed++;
          errors.push(`导入失败: ${e.message}`);
        }
      }

      return { success, failed, errors };
    } catch (e) {
      return { success: 0, failed: 1, errors: ['JSON 解析失败'] };
    }
  }

  // 验证规则格式
  private validateRule(rule: any): boolean {
    return (
      rule.name &&
      Array.isArray(rule.fields) &&
      rule.fields.every((f: any) => f.name && f.generator) &&
      rule.options &&
      typeof rule.options.total === 'number'
    );
  }
}

export const ruleStorage = new RuleStorage();
```

### 5. 数据导出

```typescript
// utils/exporter.ts
import type { DataRule } from '../types';

export class DataExporter {
  // 导出为 JSON
  static toJSON(data: any[], pretty: boolean = true): string {
    return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  }

  // 导出为 CSV
  static toCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((h) => this.escapeCSV(row[h])).join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  // CSV 转义
  private static escapeCSV(value: any): string {
    const str = String(value ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  // 导出为 SQL
  static toSQL(data: any[], tableName: string = 'data'): string {
    if (data.length === 0) return '';

    const columns = Object.keys(data[0]);
    const rows = data.map((row) => {
      const values = columns.map((col) => {
        const value = row[col];
        if (typeof value === 'string') {
          return `'${value.replace(/'/g, "\\'")}'`;
        }
        if (value === null || value === undefined) {
          return 'NULL';
        }
        return String(value);
      });
      return `(${values.join(', ')})`;
    });

    return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES\n${rows.join(',\n')};`;
  }

  // 导出为 TypeScript 类型
  static toTypeScript(data: any[], interfaceName: string = 'Data'): string {
    if (data.length === 0) return '';

    const sample = data[0];
    const fields = Object.entries(sample).map(([key, value]) => {
      let type = 'any';
      if (typeof value === 'string') type = 'string';
      else if (typeof value === 'number') type = 'number';
      else if (typeof value === 'boolean') type = 'boolean';
      else if (Array.isArray(value)) type = 'any[]';

      return `  ${key}: ${type};`;
    });

    return `interface ${interfaceName} {\n${fields.join('\n')}\n}\n\n// 示例数据\nconst data: ${interfaceName}[] = ${JSON.stringify(data, null, 2)};`;
  }

  // 下载文件
  static download(content: string, filename: string, mimeType: string = 'text/plain'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
```

---

## Web Worker 使用

### 创建 Worker

```typescript
// hooks/useGenerator.ts
import { useRef, useState, useCallback } from 'react';
import type { DataRule, GenerateResult } from '../types';

export function useGenerator() {
  const workerRef = useRef<Worker | null>(null);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);

  const generate = useCallback(async (rule: DataRule): Promise<GenerateResult> => {
    return new Promise((resolve, reject) => {
      setIsGenerating(true);
      setProgress(0);

      // 创建 Worker
      workerRef.current = new Worker(new URL('../worker/generator.worker.ts', import.meta.url), {
        type: 'module',
      });

      // 监听消息
      workerRef.current.onmessage = (e) => {
        const { type, current, total, data, error } = e.data;

        if (type === 'progress') {
          setProgress(Math.round((current / total) * 100));
        }

        if (type === 'complete') {
          setIsGenerating(false);
          setProgress(100);

          const result: GenerateResult = {
            success: true,
            data,
            stats: {
              total: rule.options.total,
              generated: data.length,
              failed: 0,
              duration: 0,
            },
          };

          setResult(result);
          resolve(result);
        }

        if (type === 'error') {
          setIsGenerating(false);
          reject(new Error(error));
        }
      };

      // 发送任务
      workerRef.current.postMessage({
        rule,
        batchSize: 1000,
      });
    });
  }, []);

  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      setIsGenerating(false);
    }
  }, []);

  return {
    generate,
    terminate,
    progress,
    isGenerating,
    result,
  };
}
```

---

## 性能优化

### 1. Web Worker

- 将数据生成放到后台线程
- 不阻塞主线程 UI
- 支持取消和中断

### 2. 分批生成

- 每批生成 1000 条数据
- 实时发送进度
- 避免内存峰值

### 3. 唯一性处理

- 使用 Set 存储已生成的值
- 自动生成重试
- 避免无限循环

### 4. 虚拟列表

- 大数据预览使用虚拟列表
- 只渲染可见区域
- 减少 DOM 渲染

---

## 测试策略

### 单元测试

```typescript
// generators/__tests__/personal.test.ts
import { personalGenerators } from '../personal';

describe('chineseName', () => {
  it('should generate valid chinese name', () => {
    const name = personalGenerators.chineseName.generate({});
    expect(name).toMatch(/^[一-龥]{2,3}$/);
  });

  it('should respect givenNameLength', () => {
    const name = personalGenerators.chineseName.generate({
      givenNameLength: { min: 1, max: 1 },
    });
    expect(name.length).toBe(2);
  });
});

describe('email', () => {
  it('should generate valid email', () => {
    const email = personalGenerators.email.generate({});
    expect(email).toMatch(/^[a-z0-9]+@[a-z0-9]+\.[a-z]+$/);
  });
});
```

### 集成测试

```typescript
// __tests__/generator.integration.test.ts
import { useGenerator } from '../hooks/useGenerator';
import { renderHook, act } from '@testing-library/react';

describe('useGenerator', () => {
  it('should generate data', async () => {
    const { result } = renderHook(() => useGenerator());

    const rule = {
      fields: [{ id: '1', name: 'name', generator: 'chineseName', params: {}, unique: false }],
      options: { total: 10, format: 'json' as const },
    };

    await act(async () => {
      await result.current.generate(rule);
    });

    expect(result.current.result?.data).toHaveLength(10);
  });
});
```
