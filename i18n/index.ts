import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { CustomDetector } from 'i18next-browser-languagedetector'; // 💡 1. 引入官方强类型探测器接口
import LanguageDetector from 'i18next-browser-languagedetector';
import { storageUtil } from '@/utils/chromeStorage';
import dayjs from 'dayjs';

// 导入 Day.js 本地化语言包
import 'dayjs/locale/zh-cn';

// 同步加载全局核心命名空间
import commonZh from './locales/zh/common.json';
import featuresZh from './locales/zh/features.json';
import commonEn from './locales/en/common.json';
import featuresEn from './locales/en/features.json';

const resources = {
  zh: {
    common: commonZh,
    features: featuresZh,
  },
  en: {
    common: commonEn,
    features: featuresEn,
  },
};

export const SUPPORTED_LANGUAGES = ['zh', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGE_STORAGE_KEY = 'app/language';
const LANGUAGE_SNAPSHOT_KEY = 'snapshot/app/language';

/**
 * 将任意语言标识归一化为受支持的核心代码
 */
export const normalizeLanguage = (lng: string): SupportedLanguage => {
  if (!lng) return 'en';
  return lng.toLowerCase().startsWith('zh') ? 'zh' : 'en';
};

/**
 * 严格校验语言安全边界
 */
const isValidLanguage = (lng: unknown): lng is SupportedLanguage => {
  return typeof lng === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(lng);
};

/**
 * 同步从 localStorage 获取语言快照（消除异步闪烁）
 */
const getSyncLanguageSnapshot = (): SupportedLanguage | null => {
  try {
    const val = localStorage.getItem(LANGUAGE_SNAPSHOT_KEY);
    if (!val) return null;
    const parsed = JSON.parse(val) as unknown;
    return isValidLanguage(parsed) ? parsed : null;
  } catch (error) {
    console.error('[i18n] Failed to parse sync language snapshot from localStorage:', error);
    return null;
  }
};

// 💡 2. 强类型接口重塑：显式绑定 CustomDetector 类型，
// 告诉 TS 编译器这些方法将被全局 Languagedetector 框架隐式调用，彻底治愈“未使用函数”报错！
const chromeStorageDetector: CustomDetector = {
  name: 'chromeStorage',
  lookup() {
    return undefined;
  },
  cacheUserLanguage(lng: string) {
    const target = normalizeLanguage(lng);
    // 💡 修复点：对异步写盘操作追加 void 算子或 catch，吞掉 Promise 被忽略警告
    storageUtil.set(LANGUAGE_STORAGE_KEY, target).catch((err) => {
      console.error('[i18n Detector Error] Failed to write back language state:', err);
    });
  },
};

const detector = new LanguageDetector();
detector.addDetector(chromeStorageDetector);

const syncLng = getSyncLanguageSnapshot();

// 💡 3. 修复点：对 i18n.init() 返回的异步 Promise 前方追加 void 斩断依赖链，放行编译
void i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: syncLng || undefined,
    ns: ['common', 'features'],
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

// 监听语言变更
i18n.on('languageChanged', (lng) => {
  const normalizedLng = normalizeLanguage(lng);
  dayjs.locale(normalizedLng === 'zh' ? 'zh-cn' : 'en');
  localStorage.setItem(LANGUAGE_SNAPSHOT_KEY, JSON.stringify(normalizedLng));
});

// 初始化时从长期异步存储中恢复校准
storageUtil
  .get(LANGUAGE_STORAGE_KEY)
  .then((lng) => {
    const rawTargetLng = lng || syncLng;

    if (!rawTargetLng) {
      const initialLng = normalizeLanguage(i18n.language);

      // 💡 修复点：对初始化同步写盘追加安全的 Promise .catch() 异常隔离防护罩
      storageUtil.set(LANGUAGE_STORAGE_KEY, initialLng).catch((err) => {
        console.error('[i18n Init Error] Persistent sync collapsed:', err);
      });

      if (initialLng !== normalizeLanguage(i18n.language)) {
        // 💡 修复点：对 changeLanguage 异步微任务进行显式 void 断链安全隔离
        void i18n.changeLanguage(initialLng);
      }
      return;
    }

    const targetLng = normalizeLanguage(String(rawTargetLng));

    if (isValidLanguage(targetLng) && targetLng !== normalizeLanguage(i18n.language)) {
      // 💡 修复点：对 changeLanguage 异步微任务进行显式 void 断链安全隔离
      void i18n.changeLanguage(targetLng);
    }
  })
  .catch((err) => {
    console.error('[i18n Context Error] Async local storage lookup collapsed:', err);
  });

export default i18n;
