import React from 'react';
import { cn } from '@/lib/utils';
import JsonTree from './JsonTree';
import type { DiffNode, DiffResult as DiffResultType, DiffType, ViewMode } from '../types';

export interface DiffResultProps extends React.HTMLAttributes<HTMLDivElement> {
  result: DiffResultType;
  viewMode: ViewMode;
  activePath?: string;
}

export default function DiffResult({
  result,
  viewMode,
  activePath,
  className,
  ...props
}: DiffResultProps) {
  if (viewMode === 'sideBySide') {
    return (
      <div
        className={cn('flex flex-col md:flex-row gap-4 items-stretch w-full', className)}
        {...props}
      >
        <div className="flex-1 min-w-0">
          <SectionLabel text="原始 JSON" />
          <JsonTree node={result.root} side="left" activePath={activePath} />
        </div>
        <div className="flex-1 min-w-0">
          <SectionLabel text="目标 JSON" />
          <JsonTree node={result.root} side="right" activePath={activePath} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card font-mono text-xs shadow-sm overflow-x-auto min-h-[200px] max-h-[520px] overflow-y-auto p-1.5',
        className,
      )}
      {...props}
    >
      <UnifiedView node={result.root} depth={0} activePath={activePath} />
    </div>
  );
}

const SectionLabel = ({ text }: { text: string }) => (
  <span className="block mb-2 text-[10px] font-bold tracking-wider text-muted-foreground/80 uppercase px-0.5 select-none">
    {text}
  </span>
);

const formatPrimitive = (v: unknown): string => {
  if (v === undefined) return 'undefined';
  if (v === null) return 'null';
  if (typeof v === 'string') return JSON.stringify(v);
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return JSON.stringify(v);
};

const isContainerType = (v: unknown): boolean =>
  (typeof v === 'object' && v !== null) || Array.isArray(v);

const prefixForType = (type: DiffType): string => {
  if (type === 'added') return '+';
  if (type === 'removed') return '-';
  if (type === 'modified') return '~';
  return ' ';
};

const typeThemeMap = {
  added: {
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/5 dark:bg-emerald-500/10',
  },
  removed: {
    text: 'text-destructive',
    bg: 'bg-destructive/5 dark:bg-destructive/10',
  },
  modified: {
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/5 dark:bg-amber-500/10',
  },
  unchanged: {
    text: 'text-foreground/80',
    bg: 'bg-transparent',
  },
};

interface UnifiedViewProps {
  node: DiffNode;
  depth: number;
  activePath?: string;
}

const UnifiedView = ({ node, depth, activePath }: UnifiedViewProps) => {
  const isRoot = depth === 0;
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const isContainer =
    hasChildren || isContainerType(node.oldValue) || isContainerType(node.newValue);
  const keyLabel = isRoot ? '' : `${node.key}: `;

  if (!isContainer) {
    if (node.type === 'modified') {
      return (
        <>
          <UnifiedRow
            depth={depth}
            type="removed"
            text={`${keyLabel}${formatPrimitive(node.oldValue)}`}
            active={activePath === node.path}
          />
          <UnifiedRow
            depth={depth}
            type="added"
            text={`${keyLabel}${formatPrimitive(node.newValue)}`}
            active={activePath === node.path}
          />
        </>
      );
    }
    const value = node.type === 'added' ? node.newValue : node.oldValue;
    return (
      <UnifiedRow
        depth={depth}
        type={node.type}
        text={`${keyLabel}${formatPrimitive(value)}`}
        active={activePath === node.path}
      />
    );
  }

  if (node.type === 'added') {
    return (
      <UnifiedRow
        depth={depth}
        type="added"
        text={`${keyLabel}${stringifyMultiline(node.newValue, depth)}`}
        active={activePath === node.path}
        multiline
      />
    );
  }
  if (node.type === 'removed') {
    return (
      <UnifiedRow
        depth={depth}
        type="removed"
        text={`${keyLabel}${stringifyMultiline(node.oldValue, depth)}`}
        active={activePath === node.path}
        multiline
      />
    );
  }

  const isArr = Array.isArray(node.oldValue) || Array.isArray(node.newValue);
  const open = isArr ? '[' : '{';
  const close = isArr ? ']' : '}';

  return (
    <>
      <UnifiedRow depth={depth} type="unchanged" text={`${keyLabel}${open}`} />
      {node.children?.map((child) => (
        <UnifiedView key={child.path} node={child} depth={depth + 1} activePath={activePath} />
      ))}
      <UnifiedRow depth={depth} type="unchanged" text={close} />
    </>
  );
};

interface UnifiedRowProps {
  depth: number;
  type: DiffType;
  text: string;
  active?: boolean;
  multiline?: boolean;
}

const UnifiedRow = ({ depth, type, text, active, multiline }: UnifiedRowProps) => {
  const currentTheme = typeThemeMap[type] || typeThemeMap.unchanged;

  return (
    <div
      className={cn(
        'flex items-start w-full font-mono py-0.5 select-text group',
        currentTheme.bg,
        currentTheme.text,
        active &&
          'bg-primary/10 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-blue-500',
      )}
      style={{
        paddingLeft: `${Math.max(0.5, depth * 1.25)}rem`,
        paddingRight: '0.5rem',
      }}
    >
      <span className="font-bold w-5 shrink-0 text-center select-none opacity-70 tabular-nums">
        {prefixForType(type)}
      </span>

      <span
        className={cn(
          'flex-1 break-all tracking-tight leading-normal',
          multiline ? 'whitespace-pre' : 'whitespace-nowrap',
        )}
      >
        {text}
      </span>
    </div>
  );
};

const stringifyMultiline = (v: unknown, depth: number): string => {
  try {
    const json = JSON.stringify(v, null, 2);
    if (!json) return formatPrimitive(v);
    const indent = '  '.repeat(depth);
    return json
      .split('\n')
      .map((line, idx) => (idx === 0 ? line : indent + line))
      .join('\n');
  } catch {
    return formatPrimitive(v);
  }
};
