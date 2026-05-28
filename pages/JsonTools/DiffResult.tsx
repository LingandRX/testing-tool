import React from 'react';
import { useI18n } from '@/utils/chromeI18n';
import { cn } from '@/lib/utils';
import JsonTree from './JsonTree';
import type { DiffNode, DiffResult as DiffResultType, DiffType, ViewMode } from './types';

// 💡 顶层 Interface 继承原生 HTML 容器属性，扩展灵活性
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
  const { t } = useI18n('jsonDiff');

  if (viewMode === 'sideBySide') {
    return (
      <div
        className={cn('flex flex-col md:flex-row gap-4 items-stretch w-full', className)}
        {...props}
      >
        <div className="flex-1 min-w-0">
          <SectionLabel text={t('jsonDiff:leftLabel')} />
          <JsonTree node={result.root} side="left" activePath={activePath} />
        </div>
        <div className="flex-1 min-w-0">
          <SectionLabel text={t('jsonDiff:rightLabel')} />
          <JsonTree node={result.root} side="right" activePath={activePath} />
        </div>
      </div>
    );
  }

  return (
    /* 1. 单栏拍平视图容器：
      - 对齐 shadcn 规范，使用 bg-card、border-border 隔离。
      - 注入 tabular-nums 配合 font-mono，消灭任何行高和字符抖动。
    */
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

// 2. 状态色彩超进化：
// 拒绝硬编码实色系，全部换用高度安全的语义色变体与暗黑模式自适应。
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

  // 容器节点整块渲染处理
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
  // 3. 高精度提取状态样式映射
  const currentTheme = typeThemeMap[type] || typeThemeMap.unchanged;

  return (
    <div
      className={cn(
        'flex items-start w-full font-mono py-0.5 select-text group',
        currentTheme.bg,
        currentTheme.text,
        // 4. 高亮定位条：不再使用生硬的蓝圆环，改为现代编辑器的“侧边左高亮带”设计，质感直接拉满
        active &&
          'bg-primary/10 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-blue-500',
      )}
      style={{
        // 维持高精度的 Padding 基线缩进
        paddingLeft: `${Math.max(0.5, depth * 1.25)}rem`,
        paddingRight: '0.5rem',
      }}
    >
      {/* 5. 前缀标识：等宽锁定，强行占据 w-5 并让符号居中对齐，达成 VSCode 般的整洁排版 */}
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

// 💡 彻底移除了文件底部引发 TS2484 冲突的 export type { DiffResultProps } 声明
