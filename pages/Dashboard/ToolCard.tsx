/**
 * ToolCard 组件 - 工具卡片
 *
 * 用于在仪表盘中展示各个工具功能的卡片组件，支持图标、标题、描述、
 * 快照内容展示，具备悬停动画效果。
 */
import { ChevronRight } from 'lucide-react';
import type { ComponentType } from 'react';
import type { SvgIconProps } from '@mui/material/SvgIcon';
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
  icon: ComponentType<SvgIconProps>;
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
      className="group relative rounded-2xl border border-gray-200 h-full box-border transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1"
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
              <IconComponent sx={{ fontSize: 20 }} />
            </div>
            <div>
              <span className="font-bold text-sm leading-tight text-gray-900 flex items-center gap-1">
                {title}
              </span>
              {description && (
                <span className="block text-xs text-gray-500 font-medium mt-1 overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">
                  {description}
                </span>
              )}
            </div>
          </div>
          <ChevronRight
            className="w-3 h-3 text-gray-300 mt-1 transition-all duration-300 ease-in-out group-hover:translate-x-1"
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
          <div className="mt-auto pt-4 border-t border-dashed border-gray-200 w-full">
            {snapshot}
          </div>
        )}
      </button>
    </div>
  );
}

ToolCard.displayName = 'ToolCard';
