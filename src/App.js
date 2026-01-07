import {HashRouter as Router, Routes, Route, NavLink} from 'react-router-dom';
import {useState, useEffect} from 'react';
import TimestampPage from './pages/TimestampPage';
import ElectronicWoodenFishPage from "./pages/ElectronicWoodenFishPage";
import TodoListPage from "./pages/TodoListPage";
import './App.css';

// 导航项配置数组，便于后续添加
// 为了测试折叠功能，我们添加更多导航项
const navItems = [
  {path: '/', label: 'Timestamp', element: <TimestampPage/>},
  {path: '/dzmy', label: '电子木鱼', element: <ElectronicWoodenFishPage/>},
  {path: '/todo', label: '待办', element: <TodoListPage/>},
];

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [visibleItems, setVisibleItems] = useState(navItems.length);
  
  // 检测屏幕尺寸变化
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      
      // 根据屏幕宽度决定显示多少个导航项
      if (width >= 768) {
        setVisibleItems(navItems.length); // 大屏幕显示所有
      } else if (width >= 480) {
        // 中等屏幕：如果导航项超过3个，显示3个，否则显示全部
        setVisibleItems(Math.min(3, navItems.length));
      } else {
        // 小屏幕：如果导航项超过2个，显示2个，否则显示全部
        setVisibleItems(Math.min(2, navItems.length));
      }
    };
    
    handleResize(); // 初始调用
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 计算哪些导航项应该显示，哪些应该折叠
  const visibleNavItems = navItems.slice(0, visibleItems);
  const collapsedNavItems = navItems.slice(visibleItems);
  
  return (<Router>
    
    <div className="app">
      <nav className="nav">
        <div className="nav-content">
          <ul className={`nav-list ${isMenuOpen ? 'open' : ''}`}>
            {visibleNavItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({isActive}) => isActive ? "nav-link active" : "nav-link"}
                  onClick={() => isMobile && setIsMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            
            {/* 折叠的导航项 */}
            {collapsedNavItems.length > 0 && (
              <li className="nav-collapse-item">
                <div className={`nav-collapse-content ${isMenuOpen ? 'show' : ''}`}>
                  {isMenuOpen && collapsedNavItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({isActive}) => isActive ? "nav-link active" : "nav-link"}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
                <button
                  className="nav-toggle"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label={isMenuOpen ? "收起菜单" : "展开菜单"}
                >
                  <span className="nav-toggle-icon">{isMenuOpen ? '×' : '☰'}</span>
                  {collapsedNavItems.length > 0 && !isMenuOpen && (
                    <span className="nav-collapse-count">+{collapsedNavItems.length}</span>
                  )}
                </button>
              </li>
            )}
          </ul>
        </div>
      </nav>
      
      <Routes>
        {navItems.map((item) => (
          <Route key={item.path} path={item.path} element={item.element}/>
        ))}
      </Routes>
    </div>
  </Router>);
}

export default App;
