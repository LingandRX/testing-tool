/**
 * 常量定义
 */
const Constants = {
  // 页面名称
  PAGES: {
    HOME: 'home',
    SETTINGS: 'settings',
    HISTORY: 'history',
    ABOUT: 'about'
  },

  // 存储键名
  STORAGE_KEYS: {
    APP_STATE: 'appState',
    USER_SETTINGS: 'userSettings',
    SESSION_DATA: 'sessionData'
  },

  // 默认设置
  DEFAULT_SETTINGS: {
    darkMode: false,
    autoSave: true,
    showNotifications: true,
    dataSync: false,
    fontSize: 'medium',
    language: 'zh-CN'
  },

  // 事件类型
  EVENTS: {
    PAGE_CHANGED: 'pageChanged',
    SETTINGS_UPDATED: 'settingsUpdated',
    HISTORY_ADDED: 'historyAdded',
    NOTIFICATION_SHOW: 'notificationShow'
  },

  // 颜色主题
  COLORS: {
    PRIMARY: '#4dabf7',
    SECONDARY: '#868e96',
    SUCCESS: '#51cf66',
    WARNING: '#fcc419',
    DANGER: '#ff6b6b',
    INFO: '#339af0'
  },

  // 动画时长（毫秒）
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },

  // API配置
  API_CONFIG: {
    TIMEOUT: 10000,
    RETRY_COUNT: 3,
    RETRY_DELAY: 1000
  }
};

export default Constants;