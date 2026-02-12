import { NavLink } from 'react-router-dom';
import { useState, useEffect, ReactNode } from 'react';
import { IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

interface RouteItem {
  path: string;
  label: string;
  element: ReactNode;
}

interface NavbarProps {
  items?: RouteItem[];
}

function Navbar({ items = [] }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [visibleItems, setVisibleItems] = useState(items.length);

  // 检测屏幕尺寸变化
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);

      // 根据屏幕宽度决定显示多少个导航项
      if (width >= 768) {
        setVisibleItems(items.length); // 大屏幕显示所有
      } else if (width >= 480) {
        // 中等屏幕：如果导航项超过3个，显示3个，否则显示全部
        setVisibleItems(Math.min(3, items.length));
      } else {
        // 小屏幕：如果导航项超过2个，显示2个，否则显示全部
        setVisibleItems(Math.min(2, items.length));
      }
    };

    handleResize(); // 初始调用
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [items.length]); // 添加依赖，如果 items 长度变化也需要重新计算

  // 计算哪些导航项应该显示，哪些应该折叠
  const visibleNavItems = items.slice(0, visibleItems);
  const collapsedNavItems = items.slice(visibleItems);

  return (
    <nav className="nav">
      <div className="nav-content">
        <ul className={`nav-list ${isMenuOpen ? 'open' : ''}`}>
          {/* 显示的导航项 */}
          {visibleNavItems.map((item) => (
            <li key={item?.path}>
              <NavLink
                to={item?.path}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                onClick={() => isMobile && setIsMenuOpen(false)}
              >
                {item?.label}
              </NavLink>
            </li>
          ))}

          {/* 折叠区域逻辑 */}
          {collapsedNavItems.length > 0 && (
            <li className="nav-collapse-item">
              <div className={`nav-collapse-content ${isMenuOpen ? 'show' : ''}`}>
                {isMenuOpen &&
                  collapsedNavItems.map((item) => (
                    <NavLink
                      key={item?.path}
                      to={item?.path}
                      className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item?.label}
                    </NavLink>
                  ))}
              </div>
              <IconButton
                color="inherit"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? '收起菜单' : '展开菜单'}
              >
                {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
