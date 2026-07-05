import { Button } from '@/components/ui/button';
import { useThemeToggle } from './useThemeToggle';

export default function ThemeToggleButton() {
  const { ThemeIcon, themeTitle, cycleThemeMode } = useThemeToggle();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={cycleThemeMode}
      title={themeTitle}
      aria-label={themeTitle}
      className="h-9 w-9 text-muted-foreground hover:text-foreground"
    >
      <ThemeIcon className="h-4 w-4" aria-hidden="true" />
    </Button>
  );
}
