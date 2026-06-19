import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchDropdown from './SearchDropdown';
import SearchInput from './SearchInput';
import TopBarActions from './TopBarActions';
import { useTopBar } from './useTopBar';

export default function TopBar() {
  const {
    searchQuery,
    showResults,
    searchResults,
    recentFeatures,
    selectedIndex,
    isDashboard,
    ThemeIcon,
    themeTitle,
    containerRef,
    inputRef,
    setSearchQuery,
    setShowResults,
    setSelectedIndex,
    handleSelectFeature,
    handleKeyDown,
    cycleThemeMode,
    handleOpenInTab,
    goHome,
    clearSearch,
  } = useTopBar();

  const actions = [
    { id: 'theme', icon: ThemeIcon, title: themeTitle, onClick: cycleThemeMode },
    {
      id: 'open-in-tab',
      icon: ExternalLink,
      title: '在标签页打开',
      onClick: () => {
        void handleOpenInTab();
      },
    },
  ];

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    setShowResults(true);
    setSelectedIndex(-1);
  };

  const showDropdown = showResults && (searchQuery.trim() || recentFeatures.length > 0);

  return (
    <header className="relative z-50 flex h-14 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex w-10 items-center justify-start">
        {!isDashboard && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={goHome}
            aria-label="返回首页"
            className="h-8 w-8 shadow-sm text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div ref={containerRef} className="relative mx-4 max-w-md flex-1">
        <SearchInput
          inputRef={inputRef}
          searchQuery={searchQuery}
          onSearchQueryChange={handleSearchQueryChange}
          onFocus={() => setShowResults(true)}
          onKeyDown={handleKeyDown}
          onClear={clearSearch}
        />
        {showDropdown && (
          <SearchDropdown
            searchQuery={searchQuery}
            searchResults={searchResults}
            recentFeatures={recentFeatures}
            selectedIndex={selectedIndex}
            onSelect={handleSelectFeature}
          />
        )}
      </div>

      <TopBarActions actions={actions} />
    </header>
  );
}
