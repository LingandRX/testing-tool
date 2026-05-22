import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Settings,
  ExternalLink,
  ArrowLeft,
  Search,
  History,
  X,
  Globe,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useRouter } from '@/providers/RouterProvider';
import { useThemeMode } from '@/providers/ThemeModeProvider';
import { FEATURES, FeatureConfig } from '@/config/features';
import { storageUtil } from '@/utils/chromeStorage';
import { openExtensionPage } from '@/utils/chromeTabs';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, normalizeLanguage } from '@/i18n';

const topBarStyles = {
  SEARCH_MAX_WIDTH: 400,
  DROPDOWN_MAX_HEIGHT: 300,
  Z_INDEX: 1100,
  DROPDOWN_Z_INDEX: 1200,
  SEARCH_HISTORY_LIMIT: 10,
  SEARCH_HISTORY_DISPLAY: 5,
};

export default function TopBar({ onOpenOptions }: { onOpenOptions: () => void }) {
  const { currentPage, goBack, navigateTo } = useRouter();
  const { mode, setMode } = useThemeMode();
  const { t, i18n } = useTranslation(['common', 'features']);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // 加载搜索历史
  useEffect(() => {
    storageUtil
      .get('app/searchHistory', [])
      .then((history) => {
        setSearchHistory(history || []);
      })
      .catch((error) => {
        console.error('加载搜索历史失败:', error);
      });
  }, []);

  // 模糊搜索逻辑
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return FEATURES.filter((f) => {
      if (f.key === 'dashboard') return false;
      const label = t(f.labelKey).toLowerCase();
      const desc = t(f.descriptionKey).toLowerCase();
      return label.includes(query) || desc.includes(query);
    });
  }, [searchQuery, t]);

  const displayedHistory = useMemo(() => {
    if (searchQuery.trim()) return [];
    return searchHistory.slice(0, topBarStyles.SEARCH_HISTORY_DISPLAY);
  }, [searchHistory, searchQuery]);

  const handleOpenInTab = async () => {
    await openExtensionPage('popup.html', { mode: 'tab' });
    window.close();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowResults(true);
    setSelectedIndex(-1);
  };

  const saveToHistory = async (query: string) => {
    if (!query.trim()) return;
    setSearchHistory((prev) => {
      const newHistory = [query, ...prev.filter((h) => h !== query)].slice(
        0,
        topBarStyles.SEARCH_HISTORY_LIMIT,
      );
      return newHistory;
    });
  };

  // 副作用：搜索历史变化后持久化到 storage
  useEffect(() => {
    storageUtil.set('app/searchHistory', searchHistory).catch((error) => {
      console.error('保存搜索历史失败:', error);
    });
  }, [searchHistory]);

  const handleSelectFeature = (feature: FeatureConfig) => {
    navigateTo(feature.key);
    saveToHistory(t(feature.labelKey));
    setSearchQuery('');
    setShowResults(false);
  };

  const toggleLanguage = async () => {
    const currentLng = normalizeLanguage(i18n.language);
    const currentIndex = SUPPORTED_LANGUAGES.indexOf(currentLng);
    const nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length;
    const newLng = SUPPORTED_LANGUAGES[nextIndex];
    await i18n.changeLanguage(newLng);
    await storageUtil.set('app/language', newLng);
  };

  const cycleThemeMode = () => {
    const next = { light: 'dark', dark: 'system', system: 'light' } as const;
    setMode(next[mode]);
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
      if (selectedIndex >= 0) {
        if (searchQuery.trim()) {
          handleSelectFeature(searchResults[selectedIndex]);
        } else {
          const selectedQuery = displayedHistory[selectedIndex];
          setSearchQuery(selectedQuery);
          setSelectedIndex(-1);
          // 触发搜索：如果匹配到功能则跳转，否则保持搜索词展示结果
          const matchedFeature = FEATURES.find(
            (f) => f.key !== 'dashboard' && t(f.labelKey) === selectedQuery,
          );
          if (matchedFeature) {
            handleSelectFeature(matchedFeature);
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
    <div className="flex justify-between items-center px-3 sm:px-4 py-3 border-b border-border bg-background relative z-[1100]">
      <div className="w-8 sm:w-10">
        {!isDashboard && (
          <button
            type="button"
            onClick={goBack}
            aria-label={t('common:buttons.back')}
            className="p-1.5 rounded-md bg-muted hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <span className="hidden md:block text-xs font-extrabold tracking-wider uppercase text-muted-foreground ml-2">
        {t('common:appName')}
      </span>

      <div className="flex-1 mx-2 sm:mx-4 relative max-w-[400px]">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder={t('common:buttons.search')}
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowResults(true)}
            onKeyDown={handleKeyDown}
            aria-label={t('common:buttons.search')}
            className="w-full pl-9 pr-8 py-1.5 text-sm rounded-lg border border-transparent bg-muted focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedIndex(-1);
              }}
              aria-label={t('common:buttons.clearSearch')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {showResults && (searchQuery.trim() || displayedHistory.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-popover rounded-lg shadow-lg border border-border max-h-[300px] overflow-auto z-[1200]">
            <ul role="listbox" className="py-1">
              {searchQuery.trim() ? (
                searchResults.length > 0 ? (
                  searchResults.map((feature, index) => (
                    <li
                      key={feature.key}
                      role="option"
                      aria-selected={selectedIndex === index}
                      onClick={() => handleSelectFeature(feature)}
                      className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                        selectedIndex === index ? 'bg-primary/10' : 'hover:bg-muted'
                      }`}
                    >
                      <div className="w-8 h-8 flex items-center justify-center text-muted-foreground">
                        {feature.icon && <feature.icon className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {t(feature.labelKey)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {t(feature.descriptionKey)}
                        </p>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-6 text-center">
                    <p className="text-sm text-muted-foreground">{t('common:buttons.noResults')}</p>
                  </li>
                )
              ) : (
                <>
                  <li className="px-4 py-2">
                    <span className="text-xs font-bold text-muted-foreground">
                      {t('common:buttons.recentSearch')}
                    </span>
                  </li>
                  {displayedHistory.map((item, index) => (
                    <li
                      key={item}
                      role="option"
                      aria-selected={selectedIndex === index}
                      onClick={() => {
                        setSearchQuery(item);
                        setSelectedIndex(-1);
                      }}
                      className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                        selectedIndex === index ? 'bg-primary/10' : 'hover:bg-muted'
                      }`}
                    >
                      <div className="w-8 h-8 flex items-center justify-center text-muted-foreground">
                        <History className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-foreground">{item}</span>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={toggleLanguage}
          aria-label={t('common:buttons.toggleLanguage')}
          title={t('common:buttons.toggleLanguage')}
          className="p-1.5 rounded-md hover:bg-accent transition-colors"
        >
          <Globe className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={cycleThemeMode}
          aria-label={t('common:buttons.toggleTheme')}
          title={t(`common:buttons.themeMode.${mode}`)}
          className="p-1.5 rounded-md hover:bg-accent transition-colors"
        >
          <ThemeIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleOpenInTab}
          aria-label={t('common:buttons.openInTab')}
          title={t('common:buttons.openInTab')}
          className="p-1.5 rounded-md hover:bg-accent transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onOpenOptions}
          aria-label={t('common:buttons.settings')}
          title={t('common:buttons.settings')}
          className="p-1.5 rounded-md hover:bg-accent transition-colors"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
