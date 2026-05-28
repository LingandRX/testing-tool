/**
 * chrome.i18n 类型安全 wrapper
 * 提供与 react-i18next 兼容的接口
 */

/**
 * 获取翻译文本
 * @param msgId 翻译 key（如 'timestamp_pageTitle'）
 * @param substitutions 占位符替换值（可选）
 * @returns 翻译后的文本
 */
export function getMessage(msgId: string, substitutions?: string[]): string {
  try {
    return chrome.i18n.getMessage(msgId, substitutions);
  } catch (error) {
    console.warn(`[chrome.i18n] 无法获取翻译: ${msgId}`, error);
    return msgId; // 回退到 key 本身
  }
}

/**
 * 获取当前浏览器语言
 * @returns 语言代码（如 'zh', 'en'）
 */
export function getLanguage(): string {
  const lang = chrome.i18n.getUILanguage();
  return lang.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

/**
 * 支持的语言列表
 */
export const SUPPORTED_LANGUAGES: readonly ('zh' | 'en')[] = ['zh', 'en'] as const;

/**
 * 规范化语言代码
 */
export function normalizeLanguage(lng: string): 'zh' | 'en' {
  return lng.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

/**
 * react-i18next 兼容的 Hook
 * 返回 t 函数和相关信息
 */
export function useI18n(namespace?: string | string[]) {
  const namespaces = Array.isArray(namespace) ? namespace : namespace ? [namespace] : [];

  const t = (key: string, options?: Record<string, unknown>): string => {
    let msgId = key;

    // 处理 namespace:key 格式（兼容原 i18next 用法）
    if (key.includes(':')) {
      msgId = key.replace(':', '_').replace(/\./g, '_');
    }

    // 先尝试直接查找 key
    let message = getMessage(msgId);

    // 如果直接查找未命中，尝试命名空间前缀（使用转换后的 msgId）
    if (message === msgId && namespaces.length > 0) {
      for (const ns of namespaces) {
        const candidate = `${ns}_${msgId}`;
        const result = getMessage(candidate);
        if (result !== candidate) {
          message = result;
          break;
        }
      }
    }

    // 处理插值
    if (options) {
      for (const [placeholder, value] of Object.entries(options)) {
        message = message.replace(`{{${placeholder}}}`, String(value));
      }
    }

    return message;
  };

  return {
    t,
    i18n: {
      language: getLanguage(),
      changeLanguage: (_lng?: string) => {
        // chrome.i18n 无法动态切换语言，需要刷新页面
        console.warn('[chrome.i18n] 无法动态切换语言，需要刷新页面');
        return Promise.resolve();
      },
    },
    isLoaded: true,
  };
}

/**
 * 预加载命名空间（无操作，兼容 useLazyTranslation）
 */
export async function preloadNamespaces(_namespaces: string[]): Promise<void> {
  // chrome.i18n 是同步的，无需预加载
  return Promise.resolve();
}
