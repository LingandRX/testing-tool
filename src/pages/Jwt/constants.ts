export const JWT_INPUT_PLACEHOLDER = '在此粘贴 JWT 令牌 (Encoded JWT)...';

export type JwtSectionContentKey = 'header' | 'payload';

export interface JwtSectionConfig {
  contentKey: JwtSectionContentKey;
  title: string;
  colorClass: string;
  borderClass: string;
  bgClass: string;
}

export const JWT_SECTION_CONFIG: JwtSectionConfig[] = [
  {
    contentKey: 'header',
    title: 'HEADER: 算法 & 令牌类型',
    colorClass: 'text-[#fb015b] dark:text-rose-400',
    borderClass: 'border-[#fb015b]/20 dark:border-rose-500/20',
    bgClass: 'bg-[#fb015b]/5 dark:bg-rose-500/5',
  },
  {
    contentKey: 'payload',
    title: 'PAYLOAD: 数据',
    colorClass: 'text-[#a03aff] dark:text-purple-400',
    borderClass: 'border-[#a03aff]/20 dark:border-purple-500/20',
    bgClass: 'bg-[#a03aff]/5 dark:bg-purple-500/5',
  },
];

export const JWT_SIGNATURE_SECTION = {
  title: '签名',
  titleClassName: 'text-muted-foreground/90',
  containerClassName: 'border border-border bg-secondary/40',
  emptyLabel: '无签名',
} as const;

export const JWT_JSON_CONTENT_CLASS =
  'm-0 p-3 bg-muted/30 dark:bg-muted/10 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all border border-border/50 text-foreground/90 leading-relaxed select-text';

export const JWT_TEXT_CONTENT_CLASS =
  'block text-xs font-mono break-all text-foreground/80 bg-muted/30 dark:bg-muted/10 p-3 rounded-lg border border-border/50 leading-relaxed select-text';
