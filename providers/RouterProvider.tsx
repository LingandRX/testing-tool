import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import type { PageType, StorageSchema } from '@/types/storage';
import { storageUtil } from '@/utils/chromeStorage';
import {
  getAllFeatureKeys,
  getDefaultPageOrder,
  getDefaultVisibleFeatureKeys,
} from '@/config/features';

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
  /** 仅在本地（当前组件状态）跳转，不影响其他同步端 */
  navigateLocal: (page: PageType) => void;
  /** 强制同步当前路由到存储 */
  syncNavigation: (page: PageType) => void;
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
  // 可见页面列表状态
  const [visiblePages, setVisiblePages] = useState<PageType[]>(() =>
    getSyncSnapshot(visiblePagesKey as string, getDefaultVisibleFeatureKeys(), isValidPageList),
  );
  // 页面排序状态
  const [pageOrder, setPageOrder] = useState<PageType[]>(() =>
    getSyncSnapshot(pageOrderKey as string, getDefaultPageOrder(), isValidPageList),
  );
  // 加载完成标识
  const [isLoaded, setIsLoaded] = useState(false);
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
        setVisiblePages(savedVisiblePages);
      }
      if (isValidPageList(savedPageOrder) && savedPageOrder.length > 0) {
        setPageOrder(savedPageOrder);
      }
    } catch (error) {
      console.error('加载初始路由数据失败:', error);
    } finally {
      setIsLoaded(true);
    }
  }, [defaultRoute, syncKey, syncRoute, visiblePagesKey, pageOrderKey]);

  // 组件挂载时加载初始数据
  useEffect(() => {
    loadInitialData().catch(console.error);
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

  /**
   * 监听存储变化，以便在多个入口（如 Popup 和 Options）之间同步路由和设置
   */
  useEffect(() => {
    if (!syncRoute) return;

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      // 同步当前路由
      if (syncRoute && changes[syncKey as string]) {
        const newRoute = changes[syncKey as string].newValue as PageType;
        if (newRoute && newRoute !== currentPage && isValidPage(newRoute)) {
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
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [syncRoute, currentPage, syncKey, visiblePagesKey, pageOrderKey]);

  /**
   * 跳转到指定页面
   */
  const navigateTo = (page: PageType) => {
    setCurrentPage(page);
  };

  /**
   * 仅在本地跳转，不触发自动同步（通常由 handleStorageChange 内部调用）
   */
  const navigateLocal = (page: PageType) => {
    setCurrentPage(page);
  };

  /**
   * 手动同步导航状态到存储
   */
  const syncNavigation = (page: PageType) => {
    storageUtil.set(syncKey, page as StorageSchema[typeof syncKey]).catch(console.error);
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
        navigateLocal,
        syncNavigation,
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
