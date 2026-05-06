import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { storageUtil } from '@/utils/chromeStorage';
import dayjs from 'dayjs';

// 导入语言文件
import commonZh from './locales/zh/common.json';
import featuresZh from './locales/zh/features.json';
import commonEn from './locales/en/common.json';
import featuresEn from './locales/en/features.json';
import timestampZh from './locales/zh/timestamp.json';
import timestampEn from './locales/en/timestamp.json';
import storageCleanerZh from './locales/zh/storageCleaner.json';
import storageCleanerEn from './locales/en/storageCleaner.json';
import qrCodeZh from './locales/zh/qrCode.json';
import qrCodeEn from './locales/en/qrCode.json';
import textStatisticsZh from './locales/zh/textStatistics.json';
import textStatisticsEn from './locales/en/textStatistics.json';
import jwtZh from './locales/zh/jwt.json';
import jwtEn from './locales/en/jwt.json';

const resources = {
  zh: {
    common: commonZh,
    features: featuresZh,
    timestamp: timestampZh,
    storageCleaner: storageCleanerZh,
    qrCode: qrCodeZh,
    textStatistics: textStatisticsZh,
    jwt: jwtZh,
  },
  en: {
    common: commonEn,
    features: featuresEn,
    timestamp: timestampEn,
    storageCleaner: storageCleanerEn,
    qrCode: qrCodeEn,
    textStatistics: textStatisticsEn,
    jwt: jwtEn,
  },
};

export const SUPPORTED_LANGUAGES = ['zh', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGE_STORAGE_KEY = 'app/language';
const LANGUAGE_SNAPSHOT_KEY = 'snapshot/app/language';

/**
 * 将任意语言标识归一化为受支持的语言代码
 */
export const normalizeLanguage = (lng: string): SupportedLanguage => {
  return lng.startsWith('zh') ? 'zh' : 'en';
};

/**
 * 校验语言是否受支持
 */
const isValidLanguage = (lng: unknown): lng is SupportedLanguage => {
  return typeof lng === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(lng);
};

/**
 * 同步从 localStorage 获取语言快照（用于消除异步加载产生的首屏闪烁）
 */
const getSyncLanguageSnapshot = (): SupportedLanguage | null => {
  try {
    const val = localStorage.getItem(LANGUAGE_SNAPSHOT_KEY);
    if (!val) return null;
    const parsed = JSON.parse(val) as unknown;
    return isValidLanguage(parsed) ? parsed : null;
  } catch (error) {
    console.error('解析语言同步快照失败:', error);
    return null;
  }
};

// 自定义 Chrome Storage 探测器
const chromeStorageDetector = {
  name: 'chromeStorage',
  lookup() {
    // 同步初始化已通过 getSyncLanguageSnapshot + init 的 lng 参数处理
    return undefined;
  },
  cacheUserLanguage(lng: string) {
    storageUtil.set(LANGUAGE_STORAGE_KEY, lng);
  },
};

const detector = new LanguageDetector();
detector.addDetector(chromeStorageDetector);

const syncLng = getSyncLanguageSnapshot();

i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: syncLng || undefined,
    ns: ['common', 'features', 'timestamp', 'storageCleaner', 'qrCode', 'textStatistics', 'jwt'],
    defaultNS: 'common',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['chromeStorage', 'navigator'],
      caches: ['chromeStorage'],
    },
  });

// 监听语言变化：同步 Day.js 和 localStorage 快照
i18n.on('languageChanged', (lng) => {
  const normalizedLng = normalizeLanguage(lng);
  dayjs.locale(normalizedLng === 'zh' ? 'zh-cn' : 'en');
  localStorage.setItem(LANGUAGE_SNAPSHOT_KEY, JSON.stringify(normalizedLng));
});

// 初始化时从存储中恢复语言
storageUtil.get(LANGUAGE_STORAGE_KEY).then((lng) => {
  const targetLng = lng || syncLng;

  if (targetLng && isValidLanguage(targetLng) && targetLng !== i18n.language) {
    i18n.changeLanguage(targetLng);
  } else if (!targetLng) {
    // 第一次运行，归一化并持久化初始语言
    const initialLng = normalizeLanguage(i18n.language);
    storageUtil.set(LANGUAGE_STORAGE_KEY, initialLng);
    if (initialLng !== i18n.language) {
      i18n.changeLanguage(initialLng);
    }
  }
});

export default i18n;
