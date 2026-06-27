import type { GeneratorDefinition } from '@/types/testDataGenerator';
import { randomInt, randomPick } from './random';

const SURNAMES = [
  '王',
  '李',
  '张',
  '刘',
  '陈',
  '杨',
  '赵',
  '黄',
  '周',
  '吴',
  '徐',
  '孙',
  '胡',
  '朱',
  '高',
  '林',
  '何',
  '郭',
  '马',
  '罗',
  '梁',
  '宋',
  '郑',
  '谢',
  '韩',
  '唐',
  '冯',
  '于',
  '董',
  '萧',
  '程',
  '曹',
  '袁',
  '邓',
  '许',
  '傅',
  '沈',
  '曾',
  '彭',
  '吕',
  '苏',
  '卢',
  '蒋',
  '蔡',
  '贾',
  '丁',
  '魏',
  '薛',
  '叶',
  '阎',
];

const NAME_CHARS = [
  '伟',
  '芳',
  '娜',
  '秀英',
  '敏',
  '静',
  '丽',
  '强',
  '磊',
  '洋',
  '艳',
  '勇',
  '军',
  '杰',
  '娟',
  '涛',
  '明',
  '超',
  '秀兰',
  '霞',
  '平',
  '刚',
  '桂英',
  '文',
  '华',
  '飞',
  '鑫',
  '浩',
  '凯',
  '宁',
  '建',
  '峰',
  '辉',
  '成',
  '宇',
  '博',
  '泽',
  '思',
  '睿',
  '晨',
  '阳',
  '雪',
  '冰',
  '琳',
  '瑶',
  '婷',
  '欣',
  '悦',
  '佳',
  '慧',
];

const EMAIL_DOMAINS = ['qq.com', '163.com', '126.com', 'gmail.com', 'outlook.com', 'hotmail.com'];

const PROVINCES = [
  '北京市',
  '天津市',
  '上海市',
  '重庆市',
  '河北省',
  '山西省',
  '辽宁省',
  '吉林省',
  '黑龙江省',
  '江苏省',
  '浙江省',
  '安徽省',
  '福建省',
  '江西省',
  '山东省',
  '河南省',
  '湖北省',
  '湖南省',
  '广东省',
  '海南省',
  '四川省',
  '贵州省',
  '云南省',
  '陕西省',
  '甘肃省',
  '青海省',
  '台湾省',
  '内蒙古自治区',
  '广西壮族自治区',
  '西藏自治区',
  '宁夏回族自治区',
  '新疆维吾尔自治区',
];

const CITIES: Record<string, string[]> = {
  北京市: ['东城区', '西城区', '朝阳区', '海淀区'],
  上海市: ['黄浦区', '徐汇区', '长宁区', '静安区'],
  广东省: ['广州市', '深圳市', '东莞市', '佛山市'],
  浙江省: ['杭州市', '宁波市', '温州市', '嘉兴市'],
  江苏省: ['南京市', '苏州市', '无锡市', '常州市'],
  四川省: ['成都市', '绵阳市', '德阳市', '宜宾市'],
};

export const chineseName: GeneratorDefinition = {
  id: 'chineseName',
  name: '中文姓名',
  description: '生成随机中文姓名',
  categoryId: 'personal',
  params: [],
  generate: () => {
    const surname = randomPick(SURNAMES);
    const name = randomPick(NAME_CHARS);
    return surname + name;
  },
};

export const email: GeneratorDefinition = {
  id: 'email',
  name: '邮箱',
  description: '生成随机邮箱地址',
  categoryId: 'personal',
  params: [
    {
      key: 'domain',
      label: '邮箱域名',
      type: 'select',
      defaultValue: 'random',
      description: '选择邮箱域名',
      options: [
        { label: '随机', value: 'random' },
        ...EMAIL_DOMAINS.map((d) => ({ label: d, value: d })),
      ],
    },
  ],
  generate: (params) => {
    const domain =
      params.domain === 'random' ? randomPick(EMAIL_DOMAINS) : (params.domain as string);
    const username = Math.random().toString(36).substring(2, 10);
    return `${username}@${domain}`;
  },
};

export const chinesePhone: GeneratorDefinition = {
  id: 'chinesePhone',
  name: '手机号',
  description: '生成随机中国手机号码',
  categoryId: 'personal',
  params: [
    {
      key: 'prefix',
      label: '号段前缀',
      type: 'select',
      defaultValue: 'random',
      description: '选择手机号前缀',
      options: [
        { label: '随机', value: 'random' },
        { label: '138', value: '138' },
        { label: '139', value: '139' },
        { label: '158', value: '158' },
        { label: '188', value: '188' },
        { label: '177', value: '177' },
      ],
    },
  ],
  generate: (params) => {
    const prefixes = ['138', '139', '158', '188', '177', '136', '159', '186', '135', '150'];
    const prefix = params.prefix === 'random' ? randomPick(prefixes) : (params.prefix as string);
    const suffix = String(randomInt(10000000, 99999999));
    return prefix + suffix;
  },
};

export const idCard: GeneratorDefinition = {
  id: 'idCard',
  name: '身份证号',
  description: '生成随机身份证号码',
  categoryId: 'personal',
  params: [
    {
      key: 'region',
      label: '地区',
      type: 'select',
      defaultValue: 'random',
      description: '选择身份证前6位地区码',
      options: [
        { label: '随机', value: 'random' },
        { label: '北京', value: '110101' },
        { label: '上海', value: '310101' },
        { label: '广州', value: '440103' },
        { label: '深圳', value: '440305' },
      ],
    },
  ],
  generate: (params) => {
    const regions = ['110101', '310101', '440103', '440305', '510104', '330102'];
    const region = params.region === 'random' ? randomPick(regions) : (params.region as string);
    const year = randomInt(1960, 2005);
    const month = String(randomInt(1, 12)).padStart(2, '0');
    const day = String(randomInt(1, 28)).padStart(2, '0');
    const birthday = `${year}${month}${day}`;
    const sequence = String(randomInt(1, 999)).padStart(3, '0');
    const prefix17 = region + birthday + sequence;
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      sum += parseInt(prefix17[i]) * weights[i];
    }
    const checkCode = checkCodes[sum % 11];

    return prefix17 + checkCode;
  },
  generateAtIndex: (params, index) => {
    const regions = ['110101', '310101', '440103', '440305', '510104', '330102'];
    const region =
      params.region === 'random' ? regions[index % regions.length] : (params.region as string);

    const year = 1990;
    const month = String(randomInt(1, 12)).padStart(2, '0');
    const day = String(randomInt(1, 28)).padStart(2, '0');
    const birthday = `${year}${month}${day}`;

    const sequence = String(index + 1).padStart(3, '0');
    const prefix17 = region + birthday + sequence;

    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      sum += parseInt(prefix17[i]) * weights[i];
    }
    const checkCode = checkCodes[sum % 11];

    return prefix17 + checkCode;
  },
};

export const chineseAddress: GeneratorDefinition = {
  id: 'chineseAddress',
  name: '中文地址',
  description: '生成随机中文地址',
  categoryId: 'personal',
  params: [
    {
      key: 'includeDetail',
      label: '包含详细地址',
      type: 'boolean',
      defaultValue: true,
      description: '是否包含街道门牌号',
    },
  ],
  generate: (params) => {
    const province = randomPick(PROVINCES);
    const cities = CITIES[province] || ['市区'];
    const city = randomPick(cities);
    const district = `区${randomInt(1, 20)}号`;

    if (params.includeDetail) {
      const street = `路${randomInt(1, 200)}号`;
      return `${province}${city}${district}${street}`;
    }
    return `${province}${city}${district}`;
  },
};

export const age: GeneratorDefinition = {
  id: 'age',
  name: '年龄',
  description: '生成随机年龄',
  categoryId: 'personal',
  params: [
    {
      key: 'min',
      label: '最小年龄',
      type: 'number',
      defaultValue: 18,
      min: 0,
      max: 150,
      description: '年龄最小值',
    },
    {
      key: 'max',
      label: '最大年龄',
      type: 'number',
      defaultValue: 65,
      min: 0,
      max: 150,
      description: '年龄最大值',
    },
    {
      key: 'distribution',
      label: '分布方式',
      type: 'select',
      defaultValue: 'uniform',
      description: '年龄分布方式',
      options: [
        { label: '均匀分布', value: 'uniform' },
        { label: '正态分布', value: 'normal' },
        { label: '人口统计分布', value: 'demographic' },
      ],
    },
  ],
  generate: (params) => {
    const min = (params.min as number) || 18;
    const max = (params.max as number) || 65;
    const distribution = (params.distribution as string) || 'uniform';

    if (distribution === 'normal') {
      return String(normalRandom(min, max));
    } else if (distribution === 'demographic') {
      return String(demographicRandom());
    }
    return String(randomInt(min, max));
  },
};

function normalRandom(min: number, max: number): number {
  const mean = (min + max) / 2;
  const stdDev = (max - min) / 6;
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  const value = Math.round(mean + num * stdDev);
  return Math.max(min, Math.min(max, value));
}

function demographicRandom(): number {
  const ageGroups = [
    { min: 0, max: 14, weight: 0.18 },
    { min: 15, max: 24, weight: 0.12 },
    { min: 25, max: 34, weight: 0.18 },
    { min: 35, max: 44, weight: 0.17 },
    { min: 45, max: 54, weight: 0.16 },
    { min: 55, max: 64, weight: 0.12 },
    { min: 65, max: 100, weight: 0.07 },
  ];

  const random = Math.random();
  let cumulative = 0;
  for (const group of ageGroups) {
    cumulative += group.weight;
    if (random <= cumulative) {
      return randomInt(group.min, group.max);
    }
  }
  return randomInt(25, 34);
}

export const personalGenerators: GeneratorDefinition[] = [
  chineseName,
  email,
  chinesePhone,
  idCard,
  chineseAddress,
  age,
];
