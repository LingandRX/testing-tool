// App.js
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import TimestampPage from './pages/TimestampPage';
import Navbar from '../../components/Navbar';
import RoutePersistence from '../../components/RoutePersistence';
import './App.css';

// 路由配置数据
const navItems = [{ path: '/', label: '时间戳', element: <TimestampPage /> }];

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <RoutePersistence />
      <div className="app">
        <Navbar items={navItems} />

        <Routes>
          {navItems.map((item) => (
            <Route key={item.path} path={item.path} element={item.element} />
          ))}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
