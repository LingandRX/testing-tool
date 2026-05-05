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

// 自定义 Chrome Storage 探测器
const chromeStorageDetector = {
  name: 'chromeStorage',
  lookup() {
    // 这在初始化时可能是异步的，但 i18next 探测器通常期望同步
    // 我们会在初始化后根据存储值再次调用 changeLanguage
    return undefined;
  },
  cacheUserLanguage(lng: string) {
    storageUtil.set('app/language', lng);
  },
};

const detector = new LanguageDetector();
detector.addDetector(chromeStorageDetector);

i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
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

// 监听语言变化并同步 Day.js
i18n.on('languageChanged', (lng) => {
  const dayjsLocale = lng.startsWith('zh') ? 'zh-cn' : 'en';
  dayjs.locale(dayjsLocale);
});

// 初始化时从存储中恢复语言
storageUtil.get('app/language').then((lng) => {
  if (lng && lng !== i18n.language) {
    i18n.changeLanguage(lng);
  } else if (!lng) {
    // 第一次运行，设置初始语言
    const initialLng = i18n.language.startsWith('zh') ? 'zh' : 'en';
    storageUtil.set('app/language', initialLng);
    if (initialLng !== i18n.language) {
      i18n.changeLanguage(initialLng);
    }
  }
});

export default i18n;
