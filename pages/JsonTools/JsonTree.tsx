import { useEffect, useMemo, useRef, useState } from 'react';
import type { DiffNode, DiffType } from './types';

export type TreeSide = 'left' | 'right';

interface JsonTreeProps {
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

/**
 * 决定当前节点在指定一侧是否需要渲染。
 * 例如：'added' 节点只在 right 侧出现，'removed' 节点只在 left 侧出现。
 */
const shouldRenderOnSide = (type: DiffType, side: TreeSide): boolean => {
  if (type === 'added') return side === 'right';
  if (type === 'removed') return side === 'left';
  return true;
};

const getValueForSide = (node: DiffNode, side: TreeSide): unknown => {
  return side === 'left' ? node.oldValue : node.newValue;
};

const getRowBg = (type: DiffType, side: TreeSide): string | undefined => {
  if (!shouldRenderOnSide(type, side)) return undefined;
  if (type === 'added') return 'bg-green-50';
  if (type === 'removed') return 'bg-red-50';
  if (type === 'modified') return 'bg-amber-50';
  return undefined;
};

const getValueColor = (type: DiffType, side: TreeSide): string | undefined => {
  if (!shouldRenderOnSide(type, side)) return undefined;
  if (type === 'added') return 'text-green-600';
  if (type === 'removed') return 'text-red-600';
  if (type === 'modified') return 'text-amber-600';
  return undefined;
};

const isContainerValue = (v: unknown): boolean => {
  return (typeof v === 'object' && v !== null) || Array.isArray(v);
};

const NodeRow = ({
  node,
  side,
  depth,
  defaultExpandDepth,
  activePath,
  isLastChild,
}: NodeRowProps) => {
  // 'auto' = follow defaults + activePath; otherwise user explicitly toggled
  const [override, setOverride] = useState<'auto' | 'open' | 'closed'>('auto');
  const rowRef = useRef<HTMLDivElement | null>(null);

  const onActivePath = Boolean(
    activePath &&
    (activePath === node.path ||
      activePath.startsWith(`${node.path}.`) ||
      activePath.startsWith(`${node.path}[`)),
  );

  const expanded =
    override === 'open'
      ? true
      : override === 'closed'
        ? false
        : onActivePath || depth < defaultExpandDepth;

  // 当激活路径定位到本节点时滚动到视图中心（仅 DOM 副作用，不更新 state）
  useEffect(() => {
    if (activePath === node.path) {
      rowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activePath, node.path]);

  if (!shouldRenderOnSide(node.type, side)) {
    // 渲染占位空行以保持左右两侧高度一致
    return (
      <div className="text-transparent select-none" style={{ paddingLeft: `${depth * 1.5}rem` }}>
        ·
      </div>
    );
  }

  const value = getValueForSide(node, side);
  const isContainer = isContainerValue(value) && Array.isArray(node.children);
  const isArray = Array.isArray(value);
  const bg = getRowBg(node.type, side);
  const valueColor = getValueColor(node.type, side);
  const isActive = activePath === node.path;

  // 根节点渲染
  const isRoot = depth === 0;

  if (isContainer && node.children) {
    const open = isArray ? '[' : '{';
    const close = isArray ? ']' : '}';
    return (
      <div ref={rowRef}>
        <div
          onClick={() => setOverride(expanded ? 'closed' : 'open')}
          className={`cursor-pointer pr-1 py-0.5 ${bg ?? ''} ${
            isActive ? 'ring-2 ring-blue-500 rounded' : ''
          } flex items-center gap-1 whitespace-nowrap hover:${bg ? 'bg-opacity-80' : 'bg-gray-50'}`}
          style={{ paddingLeft: `${depth * 1.5}rem` }}
        >
          <span className="w-3 text-gray-500 text-[11px]">{expanded ? '▾' : '▸'}</span>
          {!isRoot && (
            <span className="text-gray-900 font-bold">{isArrayKeyDisplay(node.key)}:</span>
          )}
          <span className="text-gray-500">{open}</span>
          {!expanded && <span className="text-gray-400 italic">{summarize(value)}</span>}
          {!expanded && (
            <span className="text-gray-500">
              {close}
              {isLastChild ? '' : ','}
            </span>
          )}
        </div>
        {expanded && (
          <div>
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
        {expanded && (
          <div
            className="text-gray-500 whitespace-nowrap"
            style={{ paddingLeft: `${depth * 1.5 + 1.0625}rem` }}
          >
            {close}
            {isLastChild ? '' : ','}
          </div>
        )}
      </div>
    );
  }

  // 叶子节点
  return (
    <div
      ref={rowRef}
      className={`pr-1 py-0.5 ${bg ?? ''} ${
        isActive ? 'ring-2 ring-blue-500 rounded' : ''
      } flex items-center gap-1 whitespace-nowrap`}
      style={{ paddingLeft: `${depth * 1.5}rem` }}
    >
      <span className="w-3" />
      {!isRoot && <span className="text-gray-900 font-bold">{isArrayKeyDisplay(node.key)}:</span>}
      <span className={valueColor ?? 'text-gray-900'}>
        {formatPrimitive(value)}
        {isLastChild ? '' : ','}
      </span>
    </div>
  );
};

const isArrayKeyDisplay = (key: string): string => {
  // 数组索引在父级渲染中已加方括号；这里仅显示对象键名
  return key;
};

const summarize = (v: unknown): string => {
  if (Array.isArray(v)) return ` ${v.length} ${v.length === 1 ? 'item' : 'items'} `;
  if (v && typeof v === 'object') {
    const n = Object.keys(v).length;
    return ` ${n} ${n === 1 ? 'key' : 'keys'} `;
  }
  return '';
};

export default function JsonTree({
  node,
  side,
  defaultExpandDepth = 2,
  activePath,
}: JsonTreeProps) {
  const sideKey = useMemo(() => side, [side]);
  return (
    <div className="p-3 rounded-lg bg-white border border-gray-200 font-mono text-sm overflow-x-auto min-h-[200px] max-h-[480px] overflow-y-auto">
      <NodeRow
        node={node}
        side={sideKey}
        depth={0}
        defaultExpandDepth={defaultExpandDepth}
        activePath={activePath}
        isLastChild
      />
    </div>
  );
}

export type { JsonTreeProps };
