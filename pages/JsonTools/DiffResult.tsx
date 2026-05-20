import { Box, Stack, Typography, useTheme } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import { jsonDiffPageStyles, surfaceTint } from '@/config/pageTheme';
import JsonTree from './JsonTree';
import type { DiffNode, DiffResult as DiffResultType, DiffType, ViewMode } from './types';

interface DiffResultProps {
  result: DiffResultType;
  viewMode: ViewMode;
  activePath?: string;
}

export default function DiffResult({ result, viewMode, activePath }: DiffResultProps) {
  const { t } = useLazyTranslation('jsonDiff');

  if (viewMode === 'sideBySide') {
    return (
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="stretch">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <SectionLabel text={t('jsonDiff:leftLabel')} />
          <JsonTree node={result.root} side="left" activePath={activePath} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <SectionLabel text={t('jsonDiff:rightLabel')} />
          <JsonTree node={result.root} side="right" activePath={activePath} />
        </Box>
      </Stack>
    );
  }

  return (
    <Box sx={jsonDiffPageStyles.TREE_CONTAINER}>
      <UnifiedView node={result.root} depth={0} activePath={activePath} />
    </Box>
  );
}

const SectionLabel = ({ text }: { text: string }) => (
  <Typography
    variant="caption"
    sx={{
      display: 'block',
      mb: 0.6,
      fontWeight: 800,
      fontSize: '0.7rem',
      letterSpacing: 0.4,
      color: 'text.secondary',
      textTransform: 'uppercase',
    }}
  >
    {text}
  </Typography>
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
  if (type === 'added') return '+ ';
  if (type === 'removed') return '- ';
  if (type === 'modified') return '~ ';
  return '  ';
};

const colorForType = (type: DiffType): string | undefined => {
  if (type === 'added') return jsonDiffPageStyles.addedText;
  if (type === 'removed') return jsonDiffPageStyles.removedText;
  if (type === 'modified') return jsonDiffPageStyles.modifiedText;
  return undefined;
};

const bgForType = (type: DiffType, theme: Theme): string | undefined => {
  if (type === 'added') return surfaceTint(theme, theme.palette.success.main, 0.15);
  if (type === 'removed') return surfaceTint(theme, theme.palette.error.main, 0.15);
  if (type === 'modified') return surfaceTint(theme, theme.palette.warning.main, 0.15);
  return undefined;
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
    // 叶子节点
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

  // 容器节点：added/removed 整块呈现
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
  const theme = useTheme();
  const color = colorForType(type);
  const bg = bgForType(type, theme);
  return (
    <Box
      sx={{
        pl: depth * 1.5,
        pr: 1,
        py: 0.2,
        bgcolor: bg,
        color: color ?? 'text.primary',
        outline: active ? '2px solid' : 'none',
        outlineColor: 'primary.main',
        borderRadius: 0.5,
        whiteSpace: multiline ? 'pre' : 'nowrap',
        fontFamily: 'monospace',
      }}
    >
      <Box component="span" sx={{ fontWeight: 800 }}>
        {prefixForType(type)}
      </Box>
      <Box component="span">{text}</Box>
    </Box>
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

export type { DiffResultProps };
