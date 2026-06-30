import { type FeatureConfig } from '@/config/features';
import SearchResultItem from './SearchResultItem';

interface SearchDropdownProps {
  searchQuery: string;
  searchResults: FeatureConfig[];
  recentFeatures: FeatureConfig[];
  selectedIndex: number;
  onSelect: (feature: FeatureConfig) => void;
}

export default function SearchDropdown({
  searchQuery,
  searchResults,
  recentFeatures,
  selectedIndex,
  onSelect,
}: SearchDropdownProps) {
  const isSearching = !!searchQuery.trim();
  const items = isSearching ? searchResults : recentFeatures;

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-80 overflow-y-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-lg fade-in-slide-top-2">
      <ul role="listbox" className="p-1.5">
        {!isSearching && items.length > 0 && (
          <li className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            最近搜索
          </li>
        )}
        {isSearching && items.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-muted-foreground">未找到相关工具</li>
        ) : (
          items.map((feature, index) => (
            <SearchResultItem
              key={feature.key}
              feature={feature}
              selected={selectedIndex === index}
              onSelect={onSelect}
            />
          ))
        )}
      </ul>
    </div>
  );
}
