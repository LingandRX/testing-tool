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
src/
├── pages/
│   └── TestDataGenerator/
│       ├── index.tsx                    # 主页面
│       ├── components/                  # 页面专属组件
│       │   ├── FieldList.tsx            # 字段列表
│       │   ├── FieldItem.tsx            # 单个字段项
│       │   ├── FieldEditor.tsx          # 字段编辑器
│       │   ├── GeneratorSelector.tsx    # 生成器选择器
│       │   ├── GeneratorConfig.tsx      # 参数配置
│       │   ├── DataPreview.tsx          # 数据预览
│       │   ├── GenerateOptions.tsx      # 生成选项
│       │   ├── GenerateButton.tsx       # 生成按钮
│       │   ├── ExportPanel.tsx          # 导出面板
│       │   └── RuleManager.tsx          # 规则管理
│       ├── hooks/                       # 页面专属钩子
│       │   └── useGenerator.ts          # 数据生成钩子
│       └── __tests__/                   # 测试文件
│           └── TestDataGenerator.test.tsx
├── lib/
│   └── generators/                      # 生成器库（独立模块）
│       ├── index.ts                     # 生成器入口
│       ├── types.ts                     # 生成器类型定义
│       ├── personal.ts                  # 个人信息生成器
│       ├── business.ts                  # 业务数据生成器
│       ├── technical.ts                 # 技术数据生成器
│       └── basic.ts                     # 基础类型生成器
├── workers/
│   └── generator.worker.ts              # Web Worker
├── types/
│   └── testDataGenerator.ts             # 类型定义
└── utils/
    ├── ruleStorage.ts                   # 规则存储
    ├── dataExporter.ts                  # 数据导出
    └── validator.ts                     # 规则校验
```

### 目录职责说明

| 目录                                  | 职责       | 说明                       |
| ------------------------------------- | ---------- | -------------------------- |
| `pages/TestDataGenerator/`            | 页面模块   | 包含页面组件和页面专属逻辑 |
| `pages/TestDataGenerator/components/` | 页面组件   | 仅属于该页面的 UI 组件     |
| `pages/TestDataGenerator/hooks/`      | 页面钩子   | 仅属于该页面的自定义钩子   |
| `lib/generators/`                     | 生成器库   | 独立的生成器模块，可复用   |
| `workers/`                            | Web Worker | 后台任务处理               |
| `types/`                              | 类型定义   | 全局共享的类型定义         |
| `utils/`                              | 工具函数   | 全局共享的工具函数         |

---

## 类型定义

### 核心类型

```typescript
// src/types/testDataGenerator.ts

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
    format: 'json' | 'csv';
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
    failedFields?: string[]; // 生成失败的字段名列表
    duration: number;
  };
}
```

---

## 核心模块

### 1. 生成器系统

```typescript
// src/lib/generators/index.ts
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
    generators: ['chineseName', 'email', 'chinesePhone', 'idCard', 'chineseAddress', 'age'],
  },
  {
    key: 'business',
    label: '业务数据',
    generators: ['orderId', 'price', 'date', 'status', 'quantity', 'rating', 'discount', 'stock'],
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
// src/lib/generators/personal.ts
export const personalGenerators = {
  chineseName: {
    name: 'chineseName',
    label: '中文姓名',
    description: '生成中文姓名，如张三、李四',
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
// src/lib/generators/business.ts
export const businessGenerators = {
  price: {
    name: 'price',
    label: '价格',
    description: '生成真实的价格数据',
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
// src/workers/generator.worker.ts
import { generators } from '@/lib/generators';

self.onmessage = function (e) {
  const { rule, batchSize } = e.data;

  // 1. 验证所有字段的生成器是否存在
  const invalidField = rule.fields.find((f) => !generators[f.generator]);
  if (invalidField) {
    self.postMessage({
      type: 'error',
      field: invalidField.name,
      error: `生成器 ${invalidField.generator} 不存在`,
    });
    return;
  }

  // 2. 生成数据
  const data: Record<string, any>[] = [];
  const usedValues: Record<string, Set<any>> = {};

  // 根据总数量决定策略
  const isLargeBatch = rule.options.total > 1000;

  // 统计信息
  let failedCount = 0;
  const failedFields: string[] = [];

  for (let i = 0; i < rule.options.total; i++) {
    const record: Record<string, any> = {};

    for (const field of rule.fields) {
      const generator = generators[field.generator];

      // 3. 判断是否需要生成数据
      const emptyRate = field.emptyRate ?? rule.options.defaultEmptyRate;
      const shouldGenerate = field.required || Math.random() * 100 >= emptyRate;

      if (!shouldGenerate) {
        // 选填字段且触发空值
        record[field.name] = null;
        continue;
      }

      let value;

      // 4. 根据条件选择生成策略
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

        // 5. 处理重试失败
        if (retryCount >= maxRetry) {
          failedCount++;
          if (!failedFields.includes(field.name)) {
            failedFields.push(field.name);
          }
          console.warn(`字段 "${field.name}" 重试 ${maxRetry} 次后仍无法生成唯一值`);
        }
      } else {
        // 策略3：非唯一性 → 普通生成
        value = generator.generate(field.params);
      }

      // 6. 记录生成的值
      if (value !== undefined) {
        record[field.name] = value;

        // 记录唯一性字段的值
        if (field.unique) {
          if (!usedValues[field.name]) {
            usedValues[field.name] = new Set();
          }
          usedValues[field.name].add(value);
        }
      } else {
        // 生成失败，设置为空值
        record[field.name] = null;
      }
    }

    data.push(record);

    // 7. 发送进度（每 batchSize 条发送一次）
    if (i % batchSize === 0) {
      self.postMessage({
        type: 'progress',
        current: i + 1,
        total: rule.options.total,
      });
    }
  }

  // 8. 发送完成结果
  self.postMessage({
    type: 'complete',
    data,
    stats: {
      total: rule.options.total,
      generated: data.length,
      failed: failedCount,
      failedFields,
    },
  });
};
```

### 4. 规则存储

```typescript
// src/utils/ruleStorage.ts
import type { DataRule } from '@/types/testDataGenerator';

const STORAGE_KEY = 'testDataGenerator_rules';
const MAX_RULES = 20; // 最大规则数量限制

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

  // 获取当前规则数量
  getCount(): number {
    return this.getAll().length;
  }

  // 检查是否达到最大数量限制
  isMaxReached(): boolean {
    return this.getCount() >= MAX_RULES;
  }

  // 保存规则
  save(rule: Omit<DataRule, 'id' | 'metadata'>): {
    success: boolean;
    rule?: DataRule;
    error?: string;
  } {
    const rules = this.getAll();

    // 检查数量限制
    if (rules.length >= MAX_RULES) {
      return {
        success: false,
        error: `已达到最大规则数量（${MAX_RULES}条），请删除一些规则后再保存`,
      };
    }

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

    return { success: true, rule: newRule };
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

  // 复制规则
  duplicate(id: string): { success: boolean; rule?: DataRule; error?: string } {
    const rules = this.getAll();

    // 检查数量限制
    if (rules.length >= MAX_RULES) {
      return {
        success: false,
        error: `已达到最大规则数量（${MAX_RULES}条），请删除一些规则后再复制`,
      };
    }

    const source = rules.find((r) => r.id === id);
    if (!source) {
      return {
        success: false,
        error: '找不到要复制的规则',
      };
    }

    const newRule: DataRule = {
      ...source,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${source.name} (副本)`,
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        useCount: 0,
      },
    };

    rules.push(newRule);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));

    return { success: true, rule: newRule };
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

      // 检查导入后总数是否超过限制
      const currentCount = this.getCount();
      const importCount = data.rules.length;
      if (currentCount + importCount > MAX_RULES) {
        return {
          success: 0,
          failed: importCount,
          errors: [
            `导入失败：当前已有 ${currentCount} 条规则，最多只能保存 ${MAX_RULES} 条，无法导入 ${importCount} 条规则`,
          ],
        };
      }

      let success = 0;
      let failed = 0;
      const errors: string[] = [];
      const rules = this.getAll();

      for (const rule of data.rules) {
        try {
          if (!this.validateRule(rule)) {
            throw new Error('规则格式不完整');
          }

          const newRule: DataRule = {
            ...rule,
            id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            metadata: {
              ...rule.metadata,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          };

          rules.push(newRule);
          success++;
        } catch (e: any) {
          failed++;
          errors.push(`导入失败: ${e.message}`);
        }
      }

      // 一次性保存所有导入的规则
      if (success > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
      }

      return { success, failed, errors };
    } catch (e) {
      return { success: 0, failed: 1, errors: ['JSON 解析失败'] };
    }
  }

  // 清空所有规则
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
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
// src/utils/dataExporter.ts
import type { DataRule } from '@/types/testDataGenerator';

export interface ExportFile {
  filename: string;
  content: string;
  mimeType: string;
}

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

  // 根据格式导出数据
  static exportByFormat(data: any[], format: 'json' | 'csv'): string {
    switch (format) {
      case 'json':
        return this.toJSON(data);
      case 'csv':
        return this.toCSV(data);
      default:
        return this.toJSON(data);
    }
  }

  // 批量导出多个规则（每个规则一个文件）
  static toMultipleFiles(rules: DataRule[], format: 'json' | 'csv'): ExportFile[] {
    return rules.map((rule) => {
      const content = this.exportByFormat([rule], format);

      return {
        filename: `${rule.name}.${format}`,
        content,
        mimeType: this.getMimeType(format),
      };
    });
  }

  // 合并导出多个规则（所有规则合并为一个文件）
  static toSingleFile(rules: DataRule[], format: 'json' | 'csv'): ExportFile {
    // 合并所有规则的字段配置
    const mergedFields = rules.flatMap((rule) => rule.fields);

    // 合并导出内容
    const content = this.exportByFormat([mergedFields], format);

    return {
      filename: `merged_rules.${format}`,
      content,
      mimeType: this.getMimeType(format),
    };
  }

  // 根据格式获取 MIME 类型
  private static getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      json: 'application/json',
      csv: 'text/csv',
    };
    return mimeTypes[format] || 'text/plain';
  }

  // 下载单个文件
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

  // 批量下载多个文件
  static downloadMultiple(files: ExportFile[]): void {
    files.forEach((file) => {
      this.download(file.content, file.filename, file.mimeType);
    });
  }

  // 下载为 ZIP（需要引入 jszip 库）
  static async downloadAsZip(
    files: ExportFile[],
    zipFilename: string = 'export.zip',
  ): Promise<void> {
    // 动态导入 jszip
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    files.forEach((file) => {
      zip.file(file.filename, file.content);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipFilename;
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
// src/pages/TestDataGenerator/hooks/useGenerator.ts
import { useRef, useState, useCallback } from 'react';
import type { DataRule, GenerateResult } from '@/types/testDataGenerator';

export function useGenerator() {
  const workerRef = useRef<Worker | null>(null);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);

  const generate = useCallback(async (rule: DataRule): Promise<GenerateResult> => {
    return new Promise((resolve, reject) => {
      setIsGenerating(true);
      setProgress(0);
      setResult(null);

      const startTime = Date.now();

      // 创建 Worker
      workerRef.current = new Worker(new URL('@/workers/generator.worker.ts', import.meta.url), {
        type: 'module',
      });

      // 监听消息
      workerRef.current.onmessage = (e) => {
        const { type, current, total, data, error, stats } = e.data;

        if (type === 'progress') {
          setProgress(Math.round((current / total) * 100));
        }

        if (type === 'complete') {
          setIsGenerating(false);
          setProgress(100);

          const duration = Date.now() - startTime;

          const result: GenerateResult = {
            success: true,
            data,
            stats: {
              total: stats.total,
              generated: stats.generated,
              failed: stats.failed,
              failedFields: stats.failedFields,
              duration,
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

      // 错误处理
      workerRef.current.onerror = (e) => {
        setIsGenerating(false);
        reject(new Error(e.message || 'Worker 执行出错'));
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
      setProgress(0);
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

### 错误处理

```typescript
// src/pages/TestDataGenerator/hooks/useErrorHandler.ts
import { useCallback } from 'react';
import type { GenerateResult } from '@/types/testDataGenerator';

export interface ErrorHandlerOptions {
  onSuccess?: (result: GenerateResult) => void;
  onWarning?: (message: string, failedFields: string[]) => void;
  onError?: (error: Error) => void;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const handleGenerateResult = useCallback(
    (result: GenerateResult) => {
      // 1. 检查是否有失败字段
      if (result.stats.failed > 0) {
        const message = `有 ${result.stats.failed} 个字段生成失败：${result.stats.failedFields?.join('、')}`;
        options.onWarning?.(message, result.stats.failedFields || []);
      } else {
        options.onSuccess?.(result);
      }
    },
    [options],
  );

  const handleGenerateError = useCallback(
    (error: Error) => {
      options.onError?.(error);
    },
    [options],
  );

  return {
    handleGenerateResult,
    handleGenerateError,
  };
}
```

---

## 错误提示机制

### 错误类型分类

| 错误类型        | 严重程度 | 触发场景                 | 提示方式      |
| --------------- | -------- | ------------------------ | ------------- |
| 生成器不存在    | 🔴 严重  | 字段配置了不存在的生成器 | toast.error   |
| Worker 执行错误 | 🔴 严重  | Web Worker 内部异常      | toast.error   |
| 重试达到上限    | 🟡 警告  | 唯一性字段无法生成唯一值 | toast.warning |
| 部分字段失败    | 🟡 警告  | 生成完成但有字段失败     | 结果面板警告  |
| 生成成功        | 🟢 成功  | 全部字段生成成功         | toast.success |

### 提示方式实现

项目使用 `sonner` 库作为 Toast 提示组件（已在项目中配置），导入方式：

```typescript
import { toast } from 'sonner';
```

```typescript
// src/pages/TestDataGenerator/index.tsx
import { useGenerator } from './hooks/useGenerator';
import { useErrorHandler } from './hooks/useErrorHandler';
import { toast } from 'sonner';

export default function TestDataGenerator() {
  const { generate, progress, isGenerating, result } = useGenerator();

  const { handleGenerateResult, handleGenerateError } = useErrorHandler({
    // 成功回调
    onSuccess: (result) => {
      toast.success(`成功生成 ${result.stats.generated} 条数据`);
    },
    // 警告回调（部分字段失败）
    onWarning: (message, failedFields) => {
      toast.warning(message);
    },
    // 错误回调（严重错误）
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleGenerate = async (rule: DataRule) => {
    try {
      const result = await generate(rule);
      handleGenerateResult(result);
    } catch (error) {
      handleGenerateError(error as Error);
    }
  };

  return (
    <div>
      {/* 生成按钮 */}
      <GenerateButton
        onClick={() => handleGenerate(currentRule)}
        disabled={isGenerating}
        loading={isGenerating}
      />

      {/* 进度条 */}
      {isGenerating && <ProgressBar progress={progress} />}

      {/* 结果面板（包含警告信息） */}
      {result && <ResultPanel result={result} />}
    </div>
  );
}
```

### 结果面板（含警告）

```typescript
// src/pages/TestDataGenerator/components/ResultPanel.tsx
import type { GenerateResult } from '@/types/testDataGenerator';

interface ResultPanelProps {
  result: GenerateResult;
}

export function ResultPanel({ result }: ResultPanelProps) {
  const { stats } = result;

  return (
    <div className="space-y-4">
      {/* 成功信息 */}
      <div className="p-4 bg-green-50 border border-green-200 rounded">
        <h3 className="text-green-800 font-medium">生成完成</h3>
        <p className="text-green-600">
          成功生成 {stats.generated} 条数据，耗时 {stats.duration}ms
        </p>
      </div>

      {/* 警告信息（有失败字段） */}
      {stats.failed > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="text-yellow-800 font-medium">部分字段生成失败</h3>
          <p className="text-yellow-600">
            有 {stats.failed} 个字段无法生成唯一值：
          </p>
          <ul className="list-disc list-inside text-yellow-600 mt-2">
            {stats.failedFields?.map((field) => (
              <li key={field}>"{field}" - 重试 100 次后仍存在重复</li>
            ))}
          </ul>
          <p className="text-yellow-500 text-sm mt-2">
            这些字段的值已设置为空，您可以尝试减少生成数量或调整字段配置
          </p>
        </div>
      )}

      {/* 数据预览 */}
      <div className="border rounded p-4">
        <h3 className="font-medium mb-2">数据预览</h3>
        <pre className="text-sm overflow-auto max-h-64">
          {JSON.stringify(result.data.slice(0, 5), null, 2)}
        </pre>
      </div>
    </div>
  );
}
```

### Toast 使用示例

项目使用 `sonner` 库，已配置在 `src/components/ui/sonner.tsx` 中，使用方式：

```typescript
import { toast } from 'sonner';

// 成功提示
toast.success('操作成功');

// 警告提示
toast.warning('有部分数据生成失败');

// 错误提示
toast.error('生成失败：生成器不存在');
```

---

## 错误处理流程图

```
┌─────────────────────────────────────────────────────────────────┐
│                      错误处理流程                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  用户点击"生成"                                                 │
│       ↓                                                         │
│  ┌─────────────────┐                                            │
│  │ Worker 执行生成 │                                            │
│  └────────┬────────┘                                            │
│           ↓                                                     │
│  ┌─────────────────┐    是    ┌─────────────────┐              │
│  │ 生成器不存在？  │ ───────→ │ toast.error     │              │
│  └────────┬────────┘          └─────────────────┘              │
│           │ 否                                                  │
│           ↓                                                     │
│  ┌─────────────────┐                                            │
│  │ 循环生成数据    │                                            │
│  └────────┬────────┘                                            │
│           ↓                                                     │
│  ┌─────────────────┐    是    ┌─────────────────┐              │
│  │ 唯一性重试失败？│ ───────→ │ 记录失败字段    │              │
│  └────────┬────────┘          └─────────────────┘              │
│           │ 否                                                  │
│           ↓                                                     │
│  ┌─────────────────┐                                            │
│  │ 发送完成结果    │                                            │
│  └────────┬────────┘                                            │
│           ↓                                                     │
│  ┌─────────────────┐    有     ┌─────────────────┐             │
│  │ failedFields？  │ ────────→ │ toast.warning   │             │
│  └────────┬────────┘           │ 结果面板显示    │             │
│           │ 无                 └─────────────────┘             │
│           ↓                                                     │
│  ┌─────────────────┐                                            │
│  │ toast.success   │                                            │
│  └─────────────────┘                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
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
