import React from 'react';
import { type FeatureConfig } from '@/config/features';
import { cn } from '@/lib/utils';

interface SearchResultItemProps {
  feature: FeatureConfig;
  selected: boolean;
  onSelect: (feature: FeatureConfig) => void;
}

const SearchResultItem = React.memo(({ feature, selected, onSelect }: SearchResultItemProps) => {
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
});
SearchResultItem.displayName = 'SearchResultItem';

export default SearchResultItem;
