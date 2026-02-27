import { NavLink, useLocation } from 'react-router-dom';
import { useState, ReactNode, MouseEvent } from 'react';
import {
  AppBar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  Toolbar,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

interface RouteItem {
  path: string;
  label: string;
  element: ReactNode;
}

interface NavbarProps {
  items?: RouteItem[];
}

function Navbar({ items = [] }: NavbarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);
  const location = useLocation();

  // Replicating the screen size logic from original component
  const isLargeScreen = useMediaQuery('(min-width:768px)');
  const isMediumScreen = useMediaQuery('(min-width:480px)');

  let visibleItemsCount: number;
  if (isLargeScreen) {
    visibleItemsCount = items.length;
  } else if (isMediumScreen) {
    visibleItemsCount = Math.min(3, items.length);
  } else {
    // Small screen
    visibleItemsCount = Math.min(2, items.length);
  }

  const visibleNavItems = items.slice(0, visibleItemsCount);
  const collapsedNavItems = items.slice(visibleItemsCount);

  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Find the current active tab index for the Tabs value
  // Using startsWith to handle nested routes correctly.
  const activeTabIndex = visibleNavItems.findIndex((item) =>
    location.pathname.startsWith(item.path),
  );

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{ backgroundColor: 'transparent', borderBottom: 1, borderColor: 'divider' }}
    >
      <Toolbar sx={{ justifyContent: 'center', position: 'relative' }}>
        <Tabs
          value={activeTabIndex === -1 ? false : activeTabIndex}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="navigation tabs"
        >
          {visibleNavItems.map((item) => (
            <Tab key={item.path} label={item.label} component={NavLink} to={item.path} />
          ))}
        </Tabs>

        {collapsedNavItems.length > 0 && (
          <Box sx={{ position: 'absolute', right: 8 }}>
            <IconButton color="inherit" aria-label="open menu" edge="end" onClick={handleMenuOpen}>
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={isMenuOpen}
              onClose={handleMenuClose}
              slotProps={{
                paper: {
                  style: {
                    maxHeight: 48 * 4.5,
                    width: '20ch',
                  },
                },
              }}
            >
              {collapsedNavItems.map((item) => (
                <MenuItem
                  key={item.path}
                  component={NavLink}
                  to={item.path}
                  onClick={handleMenuClose}
                  selected={location.pathname.startsWith(item.path)}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
