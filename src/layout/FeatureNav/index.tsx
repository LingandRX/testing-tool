import { cn } from '@/lib/utils';
import { useFeatureNav } from './useFeatureNav';

export default function FeatureNav() {
  const { navItems, currentPage, navigateTo } = useFeatureNav();

  return (
    <nav
      aria-label="功能导航"
      className="flex w-12 shrink-0 flex-col items-center gap-1 overflow-y-auto border-l border-border py-2"
    >
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
              'flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
              isActive && 'border-l-2 border-primary bg-muted text-foreground',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        );
      })}
    </nav>
  );
}
