import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { PageType, StorageSchema, ContextMenuPendingData } from '@/types/storage';
import { storageUtil } from '@/utils/chromeStorage';
import {
  getAllFeatureKeys,
  getDefaultPageOrder,
  getDefaultVisibleFeatureKeys,
} from '@/config/features';
import { saveContextMenuData, CONTEXT_MENU_DATA_EXPIRY_MS } from '@/utils/useContextMenuData';

/**
 * 校验是否为合法的页面类型
 */
const isValidPage = (page: unknown): page is PageType => {
  return typeof page === 'string' && (getAllFeatureKeys() as string[]).includes(page);
};

/**
 * 校验页面列表是否合法（所有项都必须是合法的 PageType）
 */
const isValidPageList = (pages: unknown): pages is PageType[] => {
  return Array.isArray(pages) && pages.every(isValidPage);
};

/**
 * 将已保存的列表与默认列表合并，确保新增的功能特性被自动包含
 *
 * 合并策略：
 * - 保留用户已有的自定义顺序
 * - 过滤掉已不再存在的旧项
 * - 将默认列表中存在但保存列表中缺失的新项追加到末尾
 */
const mergeWithDefaults = (saved: PageType[], defaults: PageType[]): PageType[] => {
  const savedSet = new Set(saved);
  const defaultSet = new Set(defaults);

  // 保留 saved 中仍然合法的项（按用户自定义顺序）
  const preserved = saved.filter((page) => defaultSet.has(page));

  // 追加 defaults 中有但 saved 中没有的新功能
  const newItems = defaults.filter((page) => !savedSet.has(page));

  return [...preserved, ...newItems];
};

/**
 * 路由上下文类型定义
 */
interface RouterContextType {
  /** 当前所在页面 */
  currentPage: PageType;
  /** 当前可见的页面列表（用于侧边栏/菜单显示） */
  visiblePages: PageType[];
  /** 页面显示顺序 */
  pageOrder: PageType[];
  /** 路由数据是否已从存储中加载完成 */
  isLoaded: boolean;
  /** 导航到指定页面 */
  navigateTo: (page: PageType) => void;
  /** 返回仪表盘 */
  goBack: () => void;
  /** 设置可见页面列表 */
  setVisiblePages: (pages: PageType[]) => void;
  /** 设置页面显示顺序 */
  setPageOrder: (pages: PageType[]) => void;
}

/**
 * 创建路由上下文
 */
const RouterContext = createContext<RouterContextType | null>(null);

/**
 * 路由提供者组件参数类型
 */
interface RouterProviderProps {
  /** 子组件 */
  children: ReactNode;
  /** 默认初始路由，默认为 'dashboard' */
  defaultRoute?: PageType;
  /** 是否同步路由状态到存储，默认为 true */
  syncRoute?: boolean;
  /** 存储路由状态的键名，默认为 'app/currentRoute' */
  syncKey?: keyof StorageSchema;
  /** 可见页面列表的键名，默认为 'app/visiblePages' */
  visiblePagesKey?: keyof StorageSchema;
  /** 页面排序的键名，默认为 'app/pageOrder' */
  pageOrderKey?: keyof StorageSchema;
}

/**
 * 同步从 localStorage 获取存储快照（用于消除异步加载产生的首屏闪烁）
 */
const getSyncSnapshot = <T,>(
  key: string,
  defaultValue: T,
  validator?: (val: unknown) => val is T,
): T => {
  try {
    const val = localStorage.getItem(`snapshot/${key}`);
    if (!val) return defaultValue;
    const parsed = JSON.parse(val) as unknown;
    if (validator) {
      return validator(parsed) ? parsed : defaultValue;
    }
    return (parsed as T) ?? defaultValue;
  } catch (error) {
    console.error('解析同步快照失败:', error);
    return defaultValue;
  }
};

/**
 * 路由提供者组件
 * 负责管理应用内部的路由状态、页面可见性及排序，并支持与 Chrome Storage 同步
 */
export function RouterProvider({
  children,
  defaultRoute = 'dashboard',
  syncRoute = true,
  syncKey = 'app/currentRoute',
  visiblePagesKey = 'app/visiblePages',
  pageOrderKey = 'app/pageOrder',
}: RouterProviderProps) {
  // 当前页面状态：优先从同步快照加载，并进行合法性校验
  const [currentPage, setCurrentPage] = useState<PageType>(() =>
    getSyncSnapshot(syncKey as string, defaultRoute, isValidPage),
  );
  // 可见页面列表状态：从快照加载后与默认值合并，确保新功能可见
  const [visiblePages, setVisiblePages] = useState<PageType[]>(() => {
    const snapshot = getSyncSnapshot(
      visiblePagesKey as string,
      getDefaultVisibleFeatureKeys(),
      isValidPageList,
    );
    return mergeWithDefaults(snapshot, getDefaultVisibleFeatureKeys());
  });
  // 页面排序状态：从快照加载后与默认值合并，确保新功能出现在排序中
  const [pageOrder, setPageOrder] = useState<PageType[]>(() => {
    const snapshot = getSyncSnapshot(
      pageOrderKey as string,
      getDefaultPageOrder(),
      isValidPageList,
    );
    return mergeWithDefaults(snapshot, getDefaultPageOrder());
  });
  // 加载完成标识：如果快照数据有效，直接标记为已加载，避免首屏骨架屏
  const [isLoaded, setIsLoaded] = useState(() => {
    const snapshotKey = localStorage.getItem(`snapshot/${syncKey as string}`);
    const snapshotVisible = localStorage.getItem(`snapshot/${visiblePagesKey as string}`);
    const snapshotOrder = localStorage.getItem(`snapshot/${pageOrderKey as string}`);
    // 快照数据存在且通过校验，说明之前已加载过，可跳过骨架屏
    return !!(snapshotKey && snapshotVisible && snapshotOrder);
  });
  /**
   * 从存储中加载初始路由数据
   */
  const loadInitialData = useCallback(async () => {
    try {
      const savedRoute = await storageUtil.get(syncKey, defaultRoute);
      const savedVisiblePages = await storageUtil.get(
        visiblePagesKey,
        getDefaultVisibleFeatureKeys(),
      );
      const savedPageOrder = await storageUtil.get(pageOrderKey, getDefaultPageOrder());

      // 增加数据合法性校验并进行类型收窄
      if (isValidPage(savedRoute) && syncRoute) {
        setCurrentPage(savedRoute);
      }
      if (isValidPageList(savedVisiblePages)) {
        setVisiblePages(mergeWithDefaults(savedVisiblePages, getDefaultVisibleFeatureKeys()));
      }
      if (isValidPageList(savedPageOrder) && savedPageOrder.length > 0) {
        setPageOrder(mergeWithDefaults(savedPageOrder, getDefaultPageOrder()));
      }
    } catch (error) {
      console.error('加载初始路由数据失败:', error);
    }
  }, [defaultRoute, syncKey, syncRoute, visiblePagesKey, pageOrderKey]);

  // 组件挂载时加载初始数据
  useEffect(() => {
    let cancelled = false;
    loadInitialData()
      .then(() => {
        if (!cancelled) {
          setIsLoaded(true);

          // 检查 URL 参数中的右键菜单数据
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const feature = params.get('feature') as PageType | null;
            const payload = params.get('payload');

            if (feature && payload && isValidPage(feature)) {
              saveContextMenuData({ featureKey: feature, payload }).catch(console.error);
              navigateTo(feature);

              // 清理 URL 参数
              const url = new URL(window.location.href);
              url.searchParams.delete('feature');
              url.searchParams.delete('payload');
              window.history.replaceState({}, '', url.toString());
              return;
            }
          }

          // 检查 storage 中的右键菜单待处理数据（用于 openPopup 场景）
          storageUtil
            .get('contextMenu/pendingData', undefined)
            .then((pendingData) => {
              if (
                pendingData &&
                isValidPage(pendingData.featureKey) &&
                Date.now() - pendingData.timestamp < CONTEXT_MENU_DATA_EXPIRY_MS
              ) {
                navigateTo(pendingData.featureKey as PageType);
                // 不在这里清除数据，让目标页面的 useContextMenuData 来消费和清除
              }
            })
            .catch(console.error);
        }
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [loadInitialData]);

  // 当 currentPage 改变时，如果开启了同步，则持久化到存储和本地快照
  useEffect(() => {
    if (isLoaded && syncRoute) {
      storageUtil.set(syncKey, currentPage as PageType).catch(console.error);
      localStorage.setItem(`snapshot/${syncKey}`, JSON.stringify(currentPage));
    }
  }, [currentPage, isLoaded, syncRoute, syncKey]);

  // 持久化可见页面列表
  useEffect(() => {
    if (isLoaded) {
      storageUtil.set(visiblePagesKey, visiblePages).catch(console.error);
      localStorage.setItem(`snapshot/${visiblePagesKey}`, JSON.stringify(visiblePages));
    }
  }, [visiblePages, isLoaded, visiblePagesKey]);

  // 持久化页面排序
  useEffect(() => {
    if (isLoaded) {
      storageUtil.set(pageOrderKey, pageOrder).catch(console.error);
      localStorage.setItem(`snapshot/${pageOrderKey}`, JSON.stringify(pageOrder));
    }
  }, [pageOrder, isLoaded, pageOrderKey]);

  // 用 ref 持有最新 currentPage，避免每次路由跳转都重注册 chrome.storage 监听器
  const currentPageRef = useRef(currentPage);
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  /**
   * 监听存储变化，以便在多个入口（如 Popup 和 Options）之间同步路由和设置
   */
  useEffect(() => {
    if (!syncRoute) return;

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      // 同步当前路由
      if (syncRoute && changes[syncKey as string]) {
        const newRoute = changes[syncKey as string].newValue as PageType;
        if (newRoute && newRoute !== currentPageRef.current && isValidPage(newRoute)) {
          setCurrentPage(newRoute);
        }
      }
      // 同步可见页面列表
      if (changes[visiblePagesKey as string]) {
        const newPages = changes[visiblePagesKey as string].newValue;
        if (isValidPageList(newPages)) {
          setVisiblePages(newPages);
        }
      }
      // 同步页面排序
      if (changes[pageOrderKey as string]) {
        const newOrder = changes[pageOrderKey as string].newValue;
        if (isValidPageList(newOrder)) {
          setPageOrder(newOrder);
        }
      }
      // 监听右键菜单数据变化，自动跳转到对应页面（用于 popup 已打开的场景）
      if (changes['contextMenu/pendingData']) {
        const newData = changes['contextMenu/pendingData']
          .newValue as ContextMenuPendingData | null;
        if (
          newData &&
          isValidPage(newData.featureKey) &&
          Date.now() - newData.timestamp < CONTEXT_MENU_DATA_EXPIRY_MS
        ) {
          setCurrentPage(newData.featureKey as PageType);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [syncRoute, syncKey, visiblePagesKey, pageOrderKey]);

  /**
   * 跳转到指定页面
   */
  const navigateTo = (page: PageType) => {
    setCurrentPage(page);
  };

  /**
   * 返回主仪表盘
   */
  const goBack = () => {
    setCurrentPage('dashboard');
  };

  return (
    <RouterContext.Provider
      value={{
        currentPage,
        visiblePages,
        pageOrder,
        isLoaded,
        navigateTo,
        goBack,
        setVisiblePages,
        setPageOrder,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
}

/**
 * 自定义 Hook：获取路由上下文
 * @throws {Error} 如果在 RouterProvider 之外使用则抛出异常
 */
export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}

export default RouterProvider;
