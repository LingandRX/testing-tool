import { cn } from '@/lib/utils';
import ThemeToggleButton from './ThemeToggleButton';
import { useFeatureNav } from './useFeatureNav';

export default function FeatureNav() {
  const { navItems, currentPage, navigateTo } = useFeatureNav();

  return (
    <nav aria-label="功能导航" className="flex w-12 shrink-0 flex-col border-l border-border py-2">
      <div className="flex flex-1 flex-col items-center gap-1 overflow-y-auto">
        {navItems.map(({ key, feature }) => {
          const Icon = feature.icon;
          const isActive = currentPage === key;

          return (
            <button
              key={key}
              type="button"
              title={feature.label}
              aria-label={feature.label}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => navigateTo(key)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-all duration-150 active:scale-90 hover:bg-muted hover:text-foreground',
                isActive && 'border-l-2 border-primary bg-muted text-foreground font-medium',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <div className="mt-1 flex shrink-0 items-center justify-center border-t border-border pt-1">
        <ThemeToggleButton />
      </div>
    </nav>
  );
}
