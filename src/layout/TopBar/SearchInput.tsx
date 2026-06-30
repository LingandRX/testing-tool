import { type KeyboardEvent, type RefObject } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSearchShortcutLabel } from './constants';

interface SearchInputProps {
  inputRef: RefObject<HTMLInputElement | null>;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onFocus: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
  onClear: () => void;
}

export default function SearchInput({
  inputRef,
  searchQuery,
  onSearchQueryChange,
  onFocus,
  onKeyDown,
  onClear,
}: SearchInputProps) {
  return (
    <div className="group relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-muted-foreground" />
      <Input
        ref={inputRef}
        placeholder="搜索工具..."
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        aria-label="搜索工具..."
        className="h-9 rounded-lg border-border/60 bg-muted/40 pl-9 pr-16 shadow-none focus-visible:ring-1 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
      />
      {searchQuery ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClear}
          aria-label="清除搜索"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </Button>
      ) : (
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden h-5 -translate-y-1/2 items-center rounded border border-border/60 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground/60 sm:inline-flex">
          {getSearchShortcutLabel()}
        </kbd>
      )}
    </div>
  );
}
