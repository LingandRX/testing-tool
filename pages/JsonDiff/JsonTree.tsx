import { Box, Collapse } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { jsonDiffPageStyles } from '@/config/pageTheme';
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
  if (type === 'added') return jsonDiffPageStyles.addedBg;
  if (type === 'removed') return jsonDiffPageStyles.removedBg;
  if (type === 'modified') return jsonDiffPageStyles.modifiedBg;
  return undefined;
};

const getValueColor = (type: DiffType, side: TreeSide): string | undefined => {
  if (!shouldRenderOnSide(type, side)) return undefined;
  if (type === 'added') return jsonDiffPageStyles.addedText;
  if (type === 'removed') return jsonDiffPageStyles.removedText;
  if (type === 'modified') return jsonDiffPageStyles.modifiedText;
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
    return <Box sx={{ pl: depth * 1.5, color: 'transparent', userSelect: 'none' }}>·</Box>;
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
      <Box ref={rowRef}>
        <Box
          onClick={() => setOverride(expanded ? 'closed' : 'open')}
          sx={{
            cursor: 'pointer',
            pl: depth * 1.5,
            pr: 1,
            py: 0.2,
            bgcolor: bg,
            outline: isActive ? '2px solid' : 'none',
            outlineColor: 'primary.main',
            borderRadius: 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            whiteSpace: 'nowrap',
            '&:hover': { bgcolor: bg ?? 'action.hover' },
          }}
        >
          <Box component="span" sx={{ width: 12, color: 'text.secondary', fontSize: '0.7rem' }}>
            {expanded ? '▾' : '▸'}
          </Box>
          {!isRoot && (
            <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
              {isArrayKeyDisplay(node.key)}:
            </Box>
          )}
          <Box component="span" sx={{ color: 'text.secondary' }}>
            {open}
          </Box>
          {!expanded && (
            <Box component="span" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
              {summarize(value)}
            </Box>
          )}
          {!expanded && (
            <Box component="span" sx={{ color: 'text.secondary' }}>
              {close}
              {isLastChild ? '' : ','}
            </Box>
          )}
        </Box>
        <Collapse in={expanded} unmountOnExit>
          <Box>
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
          </Box>
          <Box
            sx={{
              pl: depth * 1.5,
              color: 'text.secondary',
              whiteSpace: 'nowrap',
              ml: '17px',
            }}
          >
            {close}
            {isLastChild ? '' : ','}
          </Box>
        </Collapse>
      </Box>
    );
  }

  // 叶子节点
  return (
    <Box
      ref={rowRef}
      sx={{
        pl: depth * 1.5,
        pr: 1,
        py: 0.2,
        bgcolor: bg,
        outline: isActive ? '2px solid' : 'none',
        outlineColor: 'primary.main',
        borderRadius: 0.5,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        whiteSpace: 'nowrap',
      }}
    >
      <Box component="span" sx={{ width: 12 }} />
      {!isRoot && (
        <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
          {isArrayKeyDisplay(node.key)}:
        </Box>
      )}
      <Box component="span" sx={{ color: valueColor ?? 'text.primary' }}>
        {formatPrimitive(value)}
        {isLastChild ? '' : ','}
      </Box>
    </Box>
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
    <Box sx={jsonDiffPageStyles.TREE_CONTAINER}>
      <NodeRow
        node={node}
        side={sideKey}
        depth={0}
        defaultExpandDepth={defaultExpandDepth}
        activePath={activePath}
        isLastChild
      />
    </Box>
  );
}

export type { JsonTreeProps };
