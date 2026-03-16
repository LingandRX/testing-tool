import { NavLink, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import {
  AppBar,
  Tab,
  Tabs,
  Toolbar,
} from '@mui/material';

interface RouteItem {
  path: string;
  label: string;
  element: ReactNode;
}

interface NavbarProps {
  items?: RouteItem[];
}

function Navbar({ items = [] }: NavbarProps) {
  const location = useLocation();

  // Chrome 扩展 popup 固定尺寸，全部显示在滚动标签中
  // 精确匹配路由
  const activeTabIndex = items.findIndex((item) => location.pathname === item.path);

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{ backgroundColor: 'transparent', borderBottom: 1, borderColor: 'divider' }}
    >
      <Toolbar sx={{ justifyContent: 'center', position: 'relative' }}>
        <Tabs
          value={activeTabIndex === -1 ? 0 : activeTabIndex}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="navigation tabs"
          sx={{ minHeight: 48 }}
        >
          {items.map((item) => (
            <Tab
              key={item.path}
              label={item.label}
              component={NavLink}
              to={item.path}
              sx={{
                minWidth: 80,
                fontSize: '0.875rem',
              }}
            />
          ))}
        </Tabs>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
