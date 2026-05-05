/**
 * 应用页面类型定义
 */
export type PageType =
  | 'dashboard' // 仪表盘/首页
  | 'timestamp' // 时间戳转换工具
  | 'storageCleaner' // 存储清理工具
  | 'qrCode' // 二维码工具
  | 'textStatistics' // 文本统计工具
  | 'jwt'; // JWT 解析工具

/**
 * 表单映射条目定义
 */
export interface FormMapEntry {
  /** 条目唯一 ID */
  id: string;
  /** 在 UI 中显示的名称 */
  label_display: string;
  /** 字段特征，用于在页面中定位字段 */
  fingerprint: {
    /** CSS 选择器 */
    selector: string;
    /** name 属性 */
    name_attr: string;
    /** 占位符文本 */
    placeholder: string;
  };
  /** 填充逻辑配置 */
  action_logic: {
    /** 字段类型 */
    type: 'text' | 'select' | 'checkbox';
    /** 填充策略：固定值、随机值或序列值 */
    strategy: 'fixed' | 'random' | 'sequence';
    /** 填充的具体值或配置 */
    value: string;
  };
  /** UI 状态 */
  ui_state: {
    /** 是否被选中 */
    is_selected: boolean;
  };
}

/**
 * Chrome Storage 存储模式定义
 * 定义了所有持久化在客户端的数据结构
 */
export interface StorageSchema {
  /** 全局当前路由 */
  'app/currentRoute': PageType;
  /** Popup 窗口的当前路由 */
  'app/popupRoute': PageType;
  /** 侧边栏的当前路由 */
  'app/sidepanelRoute': PageType;
  /** 标签页的当前路由 */
  'app/tabRoute': PageType;
  /** 在菜单中可见的页面列表 (通用/旧版) */
  'app/visiblePages': PageType[];
  /** 菜单页面的显示顺序 (通用/旧版) */
  'app/pageOrder': PageType[];
  /** Popup 窗口可见的页面列表 */
  'app/popupVisiblePages': PageType[];
  /** Popup 窗口页面的显示顺序 */
  'app/popupPageOrder': PageType[];
  /** 侧边栏可见的页面列表 */
  'app/sidepanelVisiblePages': PageType[];
  /** 侧边栏页面的显示顺序 */
  'app/sidepanelPageOrder': PageType[];
  /** 标签页可见的页面列表 */
  'app/tabVisiblePages': PageType[];
  /** 标签页页面的显示顺序 */
  'app/tabPageOrder': PageType[];
  /** 上一次访问的路由路径（备用） */
  'app/lastRoute': string;
  /** 应用主题配置 */
  'app/theme': string;
  /** 存储清理工具的偏好设置 */
  'storageCleaner/preferences': StorageCleanerPreferences;
  /** 二维码工具中二维码部分是否展开 */
  'qrCode/qrExpanded': boolean;
  /** 二维码工具中 URL 部分是否展开 */
  'qrCode/urlExpanded': boolean;
  /** 搜索历史记录 */
  'app/searchHistory': string[];
}

/**
 * 字段类型偏好定义
 * 结构：{ [域名]: { [字段标识符]: 类型名称 } }
 */
export interface FieldTypePreferences {
  [domain: string]: {
    [fieldIdentifier: string]: string;
  };
}

/**
 * 存储清理工具偏好设置
 */
export interface StorageCleanerPreferences {
  /** 是否在清理后自动刷新页面 */
  autoRefresh: boolean;
  /** 默认勾选的清理类型 */
  selectedTypes: StorageCleanerOptions;
}

/**
 * 存储清理选项配置
 */
export interface StorageCleanerOptions {
  /** Local Storage */
  localStorage: boolean;
  /** Session Storage */
  sessionStorage: boolean;
  /** IndexedDB */
  indexedDB: boolean;
  /** Cookies */
  cookies: boolean;
  /** Cache Storage */
  cacheStorage: boolean;
  /** Service Workers */
  serviceWorkers: boolean;
}

/**
 * 单项存储清理结果
 */
export type StorageCleanResult =
  | {
      /** 是否清理成功 */
      success: true;
      /** 清理的数量/条数 */
      count: number;
    }
  | {
      /** 是否清理成功 */
      success: false;
      /** 错误信息 */
      error: string;
    };

/**
 * 存储清理任务汇总结果
 */
export interface CleaningResult {
  /** 整体操作是否成功 */
  success: boolean;
  /** 整体错误信息（如果有） */
  error?: string;
  /** 各项清理的具体结果 */
  localStorage?: StorageCleanResult;
  sessionStorage?: StorageCleanResult;
  indexedDB?: StorageCleanResult;
  cookies?: StorageCleanResult;
  cacheStorage?: StorageCleanResult;
  serviceWorkers?: StorageCleanResult;
}
