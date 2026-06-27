import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, MousePointerClick, Shield, ShieldCheck } from 'lucide-react';

export type RestorerStatus = 'unsupported' | 'locked' | 'unlocked';

export const CARD_CLASS =
  'w-full p-4 rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden space-y-3';

interface StatusConfig {
  badgeVariant: 'default' | 'secondary' | 'destructive';
  badgeClassName: string;
  badgeIcon: LucideIcon;
  badgeLabel: string;
  description: string;
  buttonIcon: LucideIcon;
  buttonLabel: string;
  buttonDisabled: boolean;
  buttonVariant: 'default' | 'secondary';
}

export const STATUS_CONFIG: Record<RestorerStatus, StatusConfig> = {
  unsupported: {
    badgeVariant: 'destructive',
    badgeClassName: 'gap-1 shrink-0',
    badgeIcon: AlertTriangle,
    badgeLabel: '不支持',
    description: '当前页面为浏览器内部页面或扩展页面，无法解锁右键功能。请切换到普通网页后重试。',
    buttonIcon: AlertTriangle,
    buttonLabel: '不支持',
    buttonDisabled: true,
    buttonVariant: 'secondary',
  },
  locked: {
    badgeVariant: 'secondary',
    badgeClassName: 'gap-1 shrink-0',
    badgeIcon: Shield,
    badgeLabel: '未解锁',
    description: '点击下方按钮，为当前网站临时解锁右键菜单。刷新页面后需要重新解锁。',
    buttonIcon: MousePointerClick,
    buttonLabel: '解锁当前网站右键',
    buttonDisabled: false,
    buttonVariant: 'default',
  },
  unlocked: {
    badgeVariant: 'default',
    badgeClassName: 'gap-1 bg-green-600 hover:bg-green-700 shrink-0',
    badgeIcon: ShieldCheck,
    badgeLabel: '已解锁',
    description: '当前网站右键菜单已临时解锁。刷新页面后需要重新解锁。',
    buttonIcon: MousePointerClick,
    buttonLabel: '右键已解锁',
    buttonDisabled: true,
    buttonVariant: 'secondary',
  },
};
