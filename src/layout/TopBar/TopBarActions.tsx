import { type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopBarAction {
  id: string;
  icon: LucideIcon;
  title: string;
  onClick: () => void;
}

interface TopBarActionsProps {
  actions: TopBarAction[];
}

export default function TopBarActions({ actions }: TopBarActionsProps) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      {actions.map(({ id, icon: Icon, title, onClick }) => (
        <Button
          key={id}
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClick}
          title={title}
          aria-label={title}
          className="h-8 w-8 text-muted-foreground"
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}
