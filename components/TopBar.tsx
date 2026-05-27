import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  History,
  Monitor,
  Moon,
  Search,
  Settings,
  Sun,
  X,
} from 'lucide-react';
import { useRouter } from '@/providers/RouterProvider';
import { useThemeMode } from '@/providers/ThemeModeProvider';
import { FeatureConfig, FEATURES } from '@/config/features';
import { storageUtil } from '@/utils/chromeStorage';
import { openExtensionPage } from '@/utils/chromeTabs';
import { useTranslation } from 'react-i18next';
import { normalizeLanguage, SUPPORTED_LANGUAGES } from '@/i18n';
import { cn } from '@/lib/utils'; // 1. 引入 shadcn 核心工具函数

// 常量配置抽取（无需写在全局变量或 styles 对象里）
const SEARCH_HISTORY_LIMIT = 10;
const SEARCH_HISTORY_DISPLAY = 5;

export default function TopBar({ onOpenOptions }: { onOpenOptions: () => void }) {
  const { currentPage, goBack, navigateTo } = useRouter();
  const { mode, setMode } = useThemeMode();
  const { t, i18n } = useTranslation(['common', 'features']);

  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpenInTab = async () => {
    await openExtensionPage('popup.html', { mode: 'tab' });
    window.close();
  };

  // 2. 健壮的 Click Outside 逻辑：点击空白处收起搜索框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 从 Chrome Storage 异步初始化历史记录
  useEffect(() => {
    storageUtil
      .get('app/searchHistory', [])
      .then((history) => {
        if (history) setSearchHistory(history);
      })
      .catch((err) => console.error('加载搜索历史失败:', err));
  }, []);

  // 3. 模糊搜索匹配（移除了无意义的 dashboard 干扰项）
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return FEATURES.filter((f) => {
      if (f.key === 'dashboard') return false;
      return (
        t(f.labelKey).toLowerCase().includes(query) ||
        t(f.descriptionKey).toLowerCase().includes(query)
      );
    });
  }, [searchQuery, t]);

  const displayedHistory = useMemo(() => {
    if (searchQuery.trim()) return [];
    return searchHistory.slice(0, SEARCH_HISTORY_DISPLAY);
  }, [searchHistory, searchQuery]);

  // 新增/持久化历史记录
  const saveToHistory = async (query: string) => {
    if (!query.trim()) return;
    const nextHistory = [query, ...searchHistory.filter((h) => h !== query)].slice(
      0,
      SEARCH_HISTORY_LIMIT,
    );
    setSearchHistory(nextHistory);
    await storageUtil.set('app/searchHistory', nextHistory).catch((err) => console.error(err));
  };

  const handleSelectFeature = (feature: FeatureConfig) => {
    navigateTo(feature.key);
    saveToHistory(t(feature.labelKey));
    setSearchQuery('');
    setShowResults(false);
  };

  const toggleLanguage = async () => {
    const currentLng = normalizeLanguage(i18n.language);
    const currentIndex = SUPPORTED_LANGUAGES.indexOf(currentLng);
    const nextLng = SUPPORTED_LANGUAGES[(currentIndex + 1) % SUPPORTED_LANGUAGES.length];
    await i18n.changeLanguage(nextLng);
    await storageUtil.set('app/language', nextLng);
  };

  const cycleThemeMode = () => {
    const nextMap = { light: 'dark', dark: 'system', system: 'light' } as const;
    setMode(nextMap[mode]);
  };

  const ThemeIcon = mode === 'light' ? Sun : mode === 'dark' ? Moon : Monitor;

  // 4. 健壮的键盘导航交互
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = searchQuery.trim() ? searchResults.length : displayedHistory.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        if (searchQuery.trim()) {
          handleSelectFeature(searchResults[selectedIndex]);
        } else {
          const selectedQuery = displayedHistory[selectedIndex];
          setSearchQuery(selectedQuery);
          setSelectedIndex(-1);
          const matched = FEATURES.find(
            (f) => f.key !== 'dashboard' && t(f.labelKey) === selectedQuery,
          );
          if (matched) handleSelectFeature(matched);
        }
      } else if (searchQuery.trim() && searchResults.length > 0) {
        handleSelectFeature(searchResults[0]);
      }
    } else if (e.key === 'Escape') {
      setShowResults(false);
      inputRef.current?.blur();
    }
  };

  const isDashboard = currentPage === 'dashboard';

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 relative z-50">
      {/* 左侧：返回按钮区 */}
      <div className="flex w-10 items-center justify-start">
        {!isDashboard && (
          <button
            type="button"
            onClick={goBack}
            aria-label={t('common:buttons.back')}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 中间：搜索容器 */}
      <div ref={containerRef} className="flex-1 mx-4 max-w-md relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder={t('common:buttons.search')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setShowResults(true)}
            onKeyDown={handleKeyDown}
            aria-label={t('common:buttons.search')}
            className="w-full h-9 pl-9 pr-8 text-sm rounded-md border border-input bg-muted/50 transition-all placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring focus:border-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedIndex(-1);
              }}
              aria-label={t('common:buttons.clearSearch')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* 动态联想结果卡片 */}
        {showResults && (searchQuery.trim() || displayedHistory.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover text-popover-foreground rounded-md shadow-md border border-border max-h-80 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-1 duration-150">
            <ul role="listbox" className="p-1">
              {searchQuery.trim() ? (
                searchResults.length > 0 ? (
                  searchResults.map((feature, index) => (
                    <li
                      key={feature.key}
                      role="option"
                      aria-selected={selectedIndex === index}
                      onClick={() => handleSelectFeature(feature)}
                      className={cn(
                        'flex items-center gap-3 px-2.5 py-2 rounded-sm cursor-pointer text-sm transition-colors',
                        selectedIndex === index
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-muted/60',
                      )}
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-muted text-muted-foreground">
                        {feature.icon && <feature.icon className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {t(feature.labelKey)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {t(feature.descriptionKey)}
                        </p>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                    {t('common:buttons.noResults')}
                  </li>
                )
              ) : (
                <>
                  <div className="px-2.5 py-1.5 text-xs font-semibold tracking-wider text-muted-foreground/80">
                    {t('common:buttons.recentSearch')}
                  </div>
                  {displayedHistory.map((item, index) => (
                    <li
                      key={item}
                      role="option"
                      aria-selected={selectedIndex === index}
                      onClick={() => {
                        setSearchQuery(item);
                        setSelectedIndex(-1);
                      }}
                      className={cn(
                        'flex items-center gap-3 px-2.5 py-2 rounded-sm cursor-pointer text-sm transition-colors',
                        selectedIndex === index
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-muted/60',
                      )}
                    >
                      <History className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{item}</span>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* 右侧：操作区 */}
      <div className="flex items-center gap-1 shrink-0">
        <IconButton onClick={toggleLanguage} title={t('common:buttons.toggleLanguage')}>
          <Globe className="h-4 w-4" />
        </IconButton>
        <IconButton onClick={cycleThemeMode} title={t(`common:buttons.themeMode.${mode}`)}>
          <ThemeIcon className="h-4 w-4" />
        </IconButton>
        <IconButton onClick={handleOpenInTab} title={t('common:buttons.openInTab')}>
          <ExternalLink className="h-4 w-4" />
        </IconButton>
        <IconButton onClick={onOpenOptions} title={t('common:buttons.settings')}>
          <Settings className="h-4 w-4" />
        </IconButton>
      </div>
    </header>
  );
}

// 5. 提炼出高度复用的原子按钮，大幅精简 Tailwind 冗余，符合 shadcn 的灵巧风格
function IconButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {children}
    </button>
  );
}
