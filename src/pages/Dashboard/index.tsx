import { cn } from '@/lib/utils';
import { useDashboard } from './useDashboard';

export default function Index() {
  const { visibleFeatures, recentFeatures, showRecent, navigateTo } = useDashboard();

  return (
    <div className={cn('flex flex-col gap-4 p-3.5 w-full h-auto select-none')}>
      {showRecent && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
            {'最近使用'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {recentFeatures.map(({ key, feature }) => {
              const IconComponent = feature.icon;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => navigateTo(key)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
                    'border border-border/60 bg-card text-card-foreground',
                    'hover:bg-muted/40 hover:border-primary/30',
                    'transition-colors cursor-pointer',
                  )}
                >
                  <IconComponent className="h-3.5 w-3.5 text-muted-foreground/70" />
                  {feature.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
          {'全部工具'}
        </h3>
        {visibleFeatures.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">{'没有可用的工具'}</p>
        ) : (
          <div
            className={cn('grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2')}
          >
            {visibleFeatures.map(({ key, feature }) => {
              const IconComponent = feature.icon;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => navigateTo(key)}
                  className={cn(
                    'group flex flex-col items-center justify-center gap-1.5',
                    'py-3 px-2 rounded-xl border border-border/50 bg-card',
                    'hover:bg-muted/40 hover:border-primary/30',
                    'transition-colors cursor-pointer',
                  )}
                >
                  <IconComponent
                    className={cn(
                      'h-5 w-5 text-muted-foreground/70',
                      'group-hover:text-foreground',
                      'transition-colors',
                    )}
                  />
                  <span className="text-[11px] font-medium text-muted-foreground/80 group-hover:text-foreground leading-tight text-center truncate w-full transition-colors">
                    {feature.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
