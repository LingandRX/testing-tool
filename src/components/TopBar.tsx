import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ExternalLink, Monitor, Moon, Search, Sun, X } from 'lucide-react';
import { useRouter } from '@/providers/RouterProvider';
import { useThemeMode } from '@/providers/ThemeModeProvider';
import { FeatureConfig, FEATURES } from '@/config/features';
import { storageUtil } from '@/utils/chromeStorage';
import { openExtensionPage } from '@/utils/chromeTabs';
import { useI18n } from '@/utils/chromeI18n';
import { cn } from '@/lib/utils';

const SEARCH_HISTORY_LIMIT = 10;
const SEARCH_HISTORY_DISPLAY = 5;

export default function TopBar() {
  const { currentPage, goBack, navigateTo } = useRouter();
  const { mode, setMode } = useThemeMode();
  const { t } = useI18n(['common', 'features']);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cmd/Ctrl+K 快捷键聚焦搜索框
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setShowResults(true);
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    storageUtil
      .get('app/searchHistory', [])
      .then((history) => {
        if (history) setSearchHistory(history);
      })
      .catch((err) => console.error('加载搜索历史失败:', err));
  }, []);

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
    return searchHistory
      .slice(0, SEARCH_HISTORY_DISPLAY)
      .map((key) => ({ key, feature: FEATURES.find((f) => f.key === key) }))
      .filter((item) => item.feature && item.feature.key !== 'dashboard');
  }, [searchHistory, searchQuery]);

  const saveToHistory = async (featureKey: string) => {
    if (!featureKey.trim()) return;
    const nextHistory = [featureKey, ...searchHistory.filter((h) => h !== featureKey)].slice(
      0,
      SEARCH_HISTORY_LIMIT,
    );
    setSearchHistory(nextHistory);
    await storageUtil.set('app/searchHistory', nextHistory).catch((err) => console.error(err));
  };

  const handleSelectFeature = (feature: FeatureConfig) => {
    navigateTo(feature.key);
    saveToHistory(feature.key);
    setSearchQuery('');
    setShowResults(false);
  };

  const cycleThemeMode = () => {
    const nextMap = { light: 'dark', dark: 'system', system: 'light' } as const;
    setMode(nextMap[mode]);
  };

  const ThemeIcon = mode === 'light' ? Sun : mode === 'dark' ? Moon : Monitor;

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
      if (selectedIndex >= 0 && selectedIndex < totalItems) {
        if (searchQuery.trim()) {
          handleSelectFeature(searchResults[selectedIndex]);
        } else {
          const selected = displayedHistory[selectedIndex];
          if (selected?.feature) {
            handleSelectFeature(selected.feature);
          }
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
            aria-label={t('common_buttons_back')}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 中间：搜索容器 */}
      <div ref={containerRef} className="flex-1 mx-4 max-w-md relative">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-muted-foreground transition-colors pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder={t('common_buttons_search')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setShowResults(true)}
            onKeyDown={handleKeyDown}
            aria-label={t('common_buttons_search')}
            className="w-full h-9 pl-9 pr-16 text-sm rounded-lg border border-border/60 bg-muted/40 transition-all placeholder:text-muted-foreground/50 focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring focus:border-input"
          />
          {!searchQuery && (
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border/60 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground/60 pointer-events-none">
              ⌘K
            </kbd>
          )}
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
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-popover text-popover-foreground rounded-lg shadow-lg border border-border max-h-80 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <ul role="listbox" className="p-1.5">
              {searchQuery.trim() ? (
                searchResults.length > 0 ? (
                  searchResults.map((feature, index) => (
                    <li
                      key={feature.key}
                      role="option"
                      aria-selected={selectedIndex === index}
                      onClick={() => handleSelectFeature(feature)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer text-sm transition-colors',
                        selectedIndex === index
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-muted/60',
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                          'bg-muted/80 text-muted-foreground',
                        )}
                      >
                        {feature.icon && <feature.icon className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {t(feature.labelKey)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
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
                  <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground/60 uppercase">
                    {t('common:buttons.recentSearch')}
                  </div>
                  {displayedHistory.map((item, index) => (
                    <li
                      key={item.key}
                      role="option"
                      aria-selected={selectedIndex === index}
                      onClick={() => item.feature && handleSelectFeature(item.feature)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-sm transition-colors',
                        selectedIndex === index
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-muted/60',
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                          'bg-muted/80 text-muted-foreground',
                        )}
                      >
                        {item.feature?.icon && <item.feature.icon className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {item.feature && t(item.feature.labelKey)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {item.feature && t(item.feature.descriptionKey)}
                        </p>
                      </div>
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
        <IconButton onClick={cycleThemeMode} title={t(`common:buttons.themeMode.${mode}`)}>
          <ThemeIcon className="h-4 w-4" />
        </IconButton>
        <IconButton onClick={handleOpenInTab} title={t('common:buttons.openInTab')}>
          <ExternalLink className="h-4 w-4" />
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
