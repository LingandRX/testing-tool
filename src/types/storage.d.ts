/**
 * 应用页面类型定义
 */
export type PageType =
  | 'dashboard' // 仪表盘/首页
  | 'timestamp' // 时间戳转换工具
  | 'storageCleaner' // 存储清理工具
  | 'qrCode' // 二维码工具
  | 'textStatistics' // 文本统计工具
  | 'jwt' // JWT 解析工具
  | 'jsonTools' // JSON 工具
  | 'base64Converter' // Base64 转换器工具
  | 'rightClickRestorer' // 右键菜单恢复工具
  | 'testDataGenerator'; // 测试数据生成器工具

/**
 * JSON 工具页面子模式类型定义
 */
export type JsonToolsPageMode = 'diff' | 'format' | 'yaml' | 'toml' | 'minify';

/**
 * Base64 转换器页面子模式类型定义
 */
export type Base64ConverterPageMode = 'text' | 'file' | 'image';

/**
 * Base64 转换器中各子模式的编码/解码方向
 */
export type Base64ConvertDirection = 'encode' | 'decode';

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
  /** RouterProvider 的默认路由键，仅当未显式传入 syncKey 时使用（popup/sidepanel/tab 入口已各自覆盖） */
  'app/currentRoute': PageType;
  /** Popup 窗口的当前路由 */
  'app/popupRoute': PageType;
  /** 侧边栏的当前路由 */
  'app/sidepanelRoute': PageType;
  /** 标签页的当前路由 */
  'app/tabRoute': PageType;
  /** RouterProvider 的默认可见页面列表键，仅当未显式传入 visiblePagesKey 时使用 */
  'app/visiblePages': PageType[];
  /** RouterProvider 的默认页面排序键，仅当未显式传入 pageOrderKey 时使用 */
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
  /** 应用主题配置 */
  'app/theme': string;
  /** 主题模式偏好（light/dark/system） */
  'app/themeMode': 'light' | 'dark' | 'system';
  /** 存储清理工具的偏好设置 */
  'storageCleaner/preferences': StorageCleanerPreferences;
  /** 二维码工具中二维码部分是否展开 */
  'qrCode/qrExpanded': boolean;
  /** 二维码工具中 URL 部分是否展开 */
  'qrCode/urlExpanded': boolean;
  /** 搜索历史记录 */
  'app/searchHistory': string[];
  /** JSON 工具页面当前子模式 */
  'jsonTools/pageMode': JsonToolsPageMode;
  /** Base64 转换器页面当前子模式 */
  'base64Converter/pageMode': Base64ConverterPageMode;
  /** Base64 转换器「文件」子模式当前方向 */
  'base64Converter/fileMode/direction': Base64ConvertDirection;
  /** Base64 转换器「图像」子模式当前方向 */
  'base64Converter/imageMode/direction': Base64ConvertDirection;
  /** 语言偏好设置 */
  'app/language': string;
  /** 右键菜单待处理数据 */
  'contextMenu/pendingData': ContextMenuPendingData;
  /** 最近使用的工具列表（最多保留 3 个） */
  'app/recentlyUsedTools': PageType[];
}

/**
 * 右键菜单待处理数据
 */
export interface ContextMenuPendingData {
  /** 功能标识 */
  featureKey: PageType;
  /** 捕获的文本或图片 URL */
  payload: string;
  /** 数据创建时间戳 */
  timestamp: number;
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
  reloadAfterClean: boolean;
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
      /** 部分成功时的已清理数量（如 IndexedDB 多库场景） */
      count?: number;
    };

/**
 * 存储清理任务汇总结果
 */
export interface CleaningResult {
  /** 整体操作是否成功 */
  overallSuccess: boolean;
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
