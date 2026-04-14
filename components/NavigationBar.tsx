import { Box } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import type { PageType } from '@/types/storage';
import { ROUTES } from '@/config/routes';
import { useRouter } from '@/providers/RouterProvider';

interface NavigationBarProps {
  onOpenOptions: () => void;
}

export default function NavigationBar({ onOpenOptions }: NavigationBarProps) {
  const { currentPage, navigateTo, visiblePages } = useRouter();

  const NavButton = ({ pageKey }: { pageKey: PageType }) => {
    const route = ROUTES.find(r => r.key === pageKey);
    if (!route) return null;

    return (
      <Box key={pageKey}>
        <button
          className={currentPage === pageKey ? 'nav-button active' : 'nav-button'}
          onClick={() => navigateTo(pageKey)}
        >
          {route.label}
        </button>
      </Box>
    );
  };

  return (
    <Box className="nav-container">
      {ROUTES
        .filter(route => visiblePages.includes(route.key))
        .map(route => <NavButton key={route.key} pageKey={route.key} />)}
      <Box key="settings" sx={{ display: 'inline-block' }}>
        <button
          className="nav-button settings-button"
          onClick={onOpenOptions}
          title="打开设置"
        >
          <SettingsIcon sx={{ fontSize: 18, verticalAlign: 'middle' }} />
        </button>
      </Box>
    </Box>
  );
}
