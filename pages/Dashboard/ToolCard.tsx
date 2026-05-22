import { ChevronRight } from 'lucide-react';
import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';
import type { PaletteColorKey } from '@/config/features';

const PALETTE_COLORS: Record<PaletteColorKey, string> = {
  primary: '#1976d2',
  success: '#2e7d32',
  warning: '#e65100',
  error: '#c62828',
  secondary: '#9c27b0',
  info: '#0288d1',
};

interface ToolCardProps {
  title: string;
  description?: string;
  snapshot?: React.ReactNode;
  colorKey: PaletteColorKey;
  icon: ComponentType<LucideProps>;
  onClick: () => void;
}

export default function ToolCard({
  title,
  description,
  snapshot,
  colorKey,
  icon: IconComponent,
  onClick,
}: ToolCardProps) {
  const colorCode = PALETTE_COLORS[colorKey];

  return (
    <div
      className="group relative rounded-2xl border border-border h-full box-border transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1"
      style={{
        borderColor: undefined,
        ['--hover-color' as string]: colorCode,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colorCode;
        e.currentTarget.style.boxShadow = `0 12px 24px -10px ${colorCode}33`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <button
        type="button"
        tabIndex={0}
        onClick={onClick}
        className="h-full flex flex-col items-stretch justify-start p-5 gap-3 w-full text-left cursor-pointer bg-transparent border-none"
      >
        <div className="flex justify-between items-start w-full">
          <div className="flex gap-3 items-center">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{
                backgroundColor: `${colorCode}11`,
                color: colorCode,
              }}
            >
              <IconComponent size={20} />
            </div>
            <div>
              <span className="font-bold text-sm leading-tight text-foreground flex items-center gap-1">
                {title}
              </span>
              {description && (
                <span className="block text-xs text-muted-foreground font-medium mt-1 overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">
                  {description}
                </span>
              )}
            </div>
          </div>
          <ChevronRight
            className="w-3 h-3 text-muted-foreground mt-1 transition-all duration-300 ease-in-out group-hover:translate-x-1"
            style={{ color: undefined }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colorCode;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '';
            }}
          />
        </div>

        {snapshot != null && (
          <div className="mt-auto pt-4 border-t border-dashed border-border w-full">{snapshot}</div>
        )}
      </button>
    </div>
  );
}

ToolCard.displayName = 'ToolCard';
