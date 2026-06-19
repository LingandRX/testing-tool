import React from 'react';
import { ArrowLeft, ExternalLink, Search, X } from 'lucide-react';
import { type FeatureConfig } from '@/config/features';
import { cn } from '@/lib/utils';
import { useTopBar } from './useTopBar';

export default function TopBar() {
  const {
    searchQuery,
    showResults,
    searchResults,
    displayedHistory,
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

  return (
    <header className="relative z-50 flex h-14 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex w-10 items-center justify-start">
        {!isDashboard && (
          <button
            type="button"
            onClick={goHome}
            aria-label="返回首页"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      <div ref={containerRef} className="relative mx-4 max-w-md flex-1">
        <div className="group relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="搜索工具..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setShowResults(true)}
            onKeyDown={handleKeyDown}
            aria-label="搜索工具..."
            className="h-9 w-full rounded-lg border border-border/60 bg-muted/40 pl-9 pr-16 text-sm transition-all placeholder:text-muted-foreground/50 focus:border-input focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {!searchQuery && (
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden h-5 -translate-y-1/2 items-center gap-0.5 rounded border border-border/60 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground/60 sm:inline-flex">
              ⌘K
            </kbd>
          )}
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="清除搜索"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {showResults && (searchQuery.trim() || displayedHistory.length > 0) && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-80 overflow-y-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
            <ul role="listbox" className="p-1.5">
              {searchQuery.trim() ? (
                searchResults.length > 0 ? (
                  searchResults.map((feature, index) => (
                    <SearchResultItem
                      key={feature.key}
                      feature={feature}
                      selected={selectedIndex === index}
                      onSelect={handleSelectFeature}
                    />
                  ))
                ) : (
                  <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                    未找到相关工具
                  </li>
                )
              ) : (
                <>
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    最近搜索
                  </div>
                  {displayedHistory.map((item, index) =>
                    item.feature ? (
                      <SearchResultItem
                        key={item.key}
                        feature={item.feature}
                        selected={selectedIndex === index}
                        onSelect={handleSelectFeature}
                      />
                    ) : null,
                  )}
                </>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <IconButton onClick={cycleThemeMode} title={themeTitle}>
          <ThemeIcon className="h-4 w-4" />
        </IconButton>
        <IconButton onClick={handleOpenInTab} title="在标签页打开">
          <ExternalLink className="h-4 w-4" />
        </IconButton>
      </div>
    </header>
  );
}

interface SearchResultItemProps {
  feature: FeatureConfig;
  selected: boolean;
  onSelect: (feature: FeatureConfig) => void;
}

function SearchResultItem({ feature, selected, onSelect }: SearchResultItemProps) {
  return (
    <li
      role="option"
      aria-selected={selected}
      onClick={() => onSelect(feature)}
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
        selected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/60',
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/80 text-muted-foreground">
        {feature.icon && <feature.icon className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{feature.label}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{feature.description}</p>
      </div>
    </li>
  );
}

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
