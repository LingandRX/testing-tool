import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react'; // 用正统的矢量箭头平替原生的字符 '▾' '▸'
import type { DiffNode, DiffType } from './types';
import { cn } from '@/lib/utils';

export type TreeSide = 'left' | 'right';

export interface JsonTreeProps extends React.HTMLAttributes<HTMLDivElement> {
  node: DiffNode;
  side: TreeSide;
  defaultExpandDepth?: number;
  activePath?: string;
}

interface NodeRowProps {
  node: DiffNode;
  side: TreeSide;
  depth: number;
  defaultExpandDepth: number;
  activePath?: string;
  isLastChild: boolean;
}

const formatPrimitive = (v: unknown): string => {
  if (v === null) return 'null';
  if (typeof v === 'string') return JSON.stringify(v);
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return JSON.stringify(v);
};

const shouldRenderOnSide = (type: DiffType, side: TreeSide): boolean => {
  if (type === 'added') return side === 'right';
  if (type === 'removed') return side === 'left';
  return true;
};

const getValueForSide = (node: DiffNode, side: TreeSide): unknown => {
  return side === 'left' ? node.oldValue : node.newValue;
};

const typeThemeMap = {
  added: {
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/5 dark:bg-emerald-500/10 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15',
  },
  removed: {
    text: 'text-destructive',
    bg: 'bg-destructive/5 dark:bg-destructive/10 hover:bg-destructive/10 dark:hover:bg-destructive/15',
  },
  modified: {
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/5 dark:bg-amber-500/10 hover:bg-amber-500/10 dark:hover:bg-amber-500/15',
  },
  unchanged: {
    text: 'text-foreground/80',
    bg: 'hover:bg-muted/60',
  },
};

const isContainerValue = (v: unknown): boolean => {
  return (typeof v === 'object' && v !== null) || Array.isArray(v);
};

const NodeRow = React.memo(
  ({ node, side, depth, defaultExpandDepth, activePath, isLastChild }: NodeRowProps) => {
    const [override, setOverride] = useState<'auto' | 'open' | 'closed'>('auto');
    const rowRef = useRef<HTMLDivElement | null>(null);

    const onActivePath = useMemo(() => {
      return Boolean(
        activePath &&
        (activePath === node.path ||
          activePath.startsWith(`${node.path}.`) ||
          activePath.startsWith(`${node.path}[`)),
      );
    }, [activePath, node.path]);

    const expanded =
      override === 'open'
        ? true
        : override === 'closed'
          ? false
          : onActivePath || depth < defaultExpandDepth;

    // 当激活路径精准定位到本行时，平滑滚动至容器中心
    useEffect(() => {
      if (activePath === node.path) {
        rowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, [activePath, node.path]);

    // 占位空行分支：必须加 h-[22px] 锁定绝对等高，防止两侧文本高度塌陷发生高低错位
    if (!shouldRenderOnSide(node.type, side)) {
      return (
        <div
          className="text-transparent select-none opacity-0 h-[22px] leading-relaxed"
          style={{ paddingLeft: `${depth * 1.15}rem` }}
        >
          ·
        </div>
      );
    }

    const value = getValueForSide(node, side);
    const isContainer = isContainerValue(value) && Array.isArray(node.children);
    const isArray = Array.isArray(value);
    const theme = typeThemeMap[node.type] || typeThemeMap.unchanged;
    const isActive = activePath === node.path;
    const isRoot = depth === 0;

    const indentStyle = {
      paddingLeft: `${Math.max(0.25, depth * 1.15)}rem`,
    };

    const indentClass = cn(
      'relative',
      depth > 0 &&
        'before:absolute before:left-[4px] before:top-0 before:bottom-0 before:w-[1px] before:bg-border/40',
    );

    if (isContainer && node.children) {
      const open = isArray ? '[' : '{';
      const close = isArray ? ']' : '}';

      return (
        <div ref={rowRef} className="w-full flex flex-col">
          {/* 大容器开端行 */}
          <div
            onClick={() => setOverride(expanded ? 'closed' : 'open')}
            className={cn(
              'group flex items-center gap-1 py-0.5 pr-2 text-xs font-mono select-none cursor-pointer rounded-sm w-full h-[22px] leading-relaxed',
              theme.bg,
              isActive &&
                'bg-primary/10 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-blue-500 rounded-none ring-0',
            )}
            style={indentStyle}
          >
            {/* 折叠小箭头：升级为精巧的 Lucide SVG 矢量微动效 */}
            <span className="w-3.5 h-3.5 flex items-center justify-center text-muted-foreground/80 shrink-0">
              {expanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </span>

            {!isRoot && (
              <span className="text-foreground/90 font-bold tracking-tight">{node.key}:</span>
            )}

            <span className="text-muted-foreground/80 font-semibold">{open}</span>

            {!expanded && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted/80 text-muted-foreground font-sans font-medium mx-1 select-none">
                {summarize(value)}
              </span>
            )}

            {!expanded && (
              <span className="text-muted-foreground/80 font-semibold">
                {close}
                {isLastChild ? '' : ','}
              </span>
            )}
          </div>

          {/* 容器子节点递归区 */}
          {expanded && (
            <div className={indentClass}>
              {node.children.map((child, idx) => (
                <NodeRow
                  key={child.path}
                  node={child}
                  side={side}
                  depth={depth + 1}
                  defaultExpandDepth={defaultExpandDepth}
                  activePath={activePath}
                  isLastChild={idx === node.children!.length - 1}
                />
              ))}
            </div>
          )}

          {/* 大容器收尾行 */}
          {expanded && (
            <div
              className="text-muted-foreground/80 font-mono text-xs py-0.5 h-[22px] leading-relaxed"
              style={{ paddingLeft: `${depth * 1.15 + 0.88}rem` }}
            >
              {close}
              {isLastChild ? '' : ','}
            </div>
          )}
        </div>
      );
    }

    // 叶子数据行分支
    return (
      <div
        ref={rowRef}
        className={cn(
          'flex items-center gap-1 py-0.5 pr-2 font-mono text-xs w-full h-[22px] leading-relaxed rounded-sm',
          theme.bg,
          isActive &&
            'bg-primary/10 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-blue-500 rounded-none ring-0',
        )}
        style={indentStyle}
      >
        <span className="w-3.5 shrink-0" /> {/* 与上方的折叠键轴线严格对齐 */}
        {!isRoot && (
          <span className="text-foreground/90 font-bold tracking-tight">{node.key}:</span>
        )}
        <span className={cn('font-medium tracking-tight truncate flex-1', theme.text)}>
          {formatPrimitive(value)}
          <span className="text-foreground/60 font-sans">{isLastChild ? '' : ','}</span>
        </span>
      </div>
    );
  },
);

NodeRow.displayName = 'NodeRow';

export default function JsonTree({
  node,
  side,
  defaultExpandDepth = 2,
  activePath,
  className,
  ...props
}: JsonTreeProps) {
  return (
    /* 最外层承载器：统一收拢至标准的 bg-card 与等宽 tabular-nums 控制轴 */
    <div
      className={cn(
        'rounded-xl border border-border bg-card text-card-foreground font-mono text-xs shadow-sm overflow-x-auto min-h-[200px] max-h-[520px] overflow-y-auto p-2.5 tabular-nums select-text',
        className,
      )}
      {...props}
    >
      <NodeRow
        node={node}
        side={side}
        depth={0}
        defaultExpandDepth={defaultExpandDepth}
        activePath={activePath}
        isLastChild
      />
    </div>
  );
}

const summarize = (v: unknown): string => {
  if (Array.isArray(v)) return `${v.length} ${v.length === 1 ? 'item' : 'items'}`;
  if (v && typeof v === 'object') {
    const n = Object.keys(v).length;
    return `${n} ${n === 1 ? 'key' : 'keys'}`;
  }
  return '';
};
