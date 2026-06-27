import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useRouter } from '@/providers/RouterProvider';
import { useThemeMode } from '@/providers/ThemeModeProvider';
import { type FeatureConfig, FEATURES } from '@/config/features';
import { useStorageState } from '@/utils/useStorageState';
import { openExtensionPage } from '@/utils/chromeTabs';
import { isSearchHistory, SEARCH_HISTORY_DISPLAY, SEARCH_HISTORY_LIMIT } from './constants';

export interface UseTopBarReturn {
  searchQuery: string;
  searchResults: FeatureConfig[];
  recentFeatures: FeatureConfig[];
  selectedIndex: number;
  isDashboard: boolean;
  ThemeIcon: typeof Sun;
  themeTitle: string;
  showDropdown: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  handleSearchQueryChange: (value: string) => void;
  handleSearchFocus: () => void;
  handleSelectFeature: (feature: FeatureConfig) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  cycleThemeMode: () => void;
  handleOpenInTab: () => Promise<void>;
  goHome: () => void;
  clearSearch: () => void;
}

export function useTopBar(): UseTopBarReturn {
  const { currentPage, goHome, navigateTo } = useRouter();
  const { mode, setMode } = useThemeMode();

  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [searchHistory, setSearchHistory] = useStorageState(
    'app/searchHistory',
    [],
    isSearchHistory,
  );
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

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return FEATURES.filter((f) => {
      if (f.key === 'dashboard') return false;
      return f.label.toLowerCase().includes(query) || f.description.toLowerCase().includes(query);
    });
  }, [searchQuery]);

  const displayedHistory = useMemo(() => {
    if (searchQuery.trim()) return [];
    return searchHistory
      .slice(0, SEARCH_HISTORY_DISPLAY)
      .map((key) => FEATURES.find((f) => f.key === key))
      .filter((feature): feature is FeatureConfig => !!feature && feature.key !== 'dashboard');
  }, [searchHistory, searchQuery]);

  const saveToHistory = (featureKey: string) => {
    setSearchHistory((prev) =>
      [featureKey, ...prev.filter((h) => h !== featureKey)].slice(0, SEARCH_HISTORY_LIMIT),
    );
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

  const themeTitle =
    mode === 'light' ? '切换到深色模式' : mode === 'dark' ? '切换到系统模式' : '切换到浅色模式';

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
      const items = searchQuery.trim() ? searchResults : displayedHistory;
      const feature =
        selectedIndex >= 0 && selectedIndex < totalItems
          ? items[selectedIndex]
          : searchQuery.trim() && searchResults.length > 0
            ? searchResults[0]
            : undefined;
      if (feature) handleSelectFeature(feature);
    } else if (e.key === 'Escape') {
      setShowResults(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedIndex(-1);
  };

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    setShowResults(true);
    setSelectedIndex(-1);
  };

  const handleSearchFocus = () => setShowResults(true);

  const showDropdown =
    showResults && (searchQuery.trim().length > 0 || displayedHistory.length > 0);

  return {
    searchQuery,
    searchResults,
    recentFeatures: displayedHistory,
    selectedIndex,
    showDropdown,
    isDashboard: currentPage === 'dashboard',
    ThemeIcon,
    themeTitle,
    containerRef,
    inputRef,
    handleSearchQueryChange,
    handleSearchFocus,
    handleSelectFeature,
    handleKeyDown,
    cycleThemeMode,
    handleOpenInTab,
    goHome,
    clearSearch,
  };
}
