// App.js
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import TimestampPage from './pages/TimestampPage';
import RecordReplayPage from './pages/RecordReplayPage';
import TestPage from './pages/TestPage';
import ReplayListPage from './pages/ReplayListPage';
import ReplayPlayerPage from './pages/ReplayPlayerPage';
import Navbar from '../../components/Navbar';
import RoutePersistence from '../../components/RoutePersistence';
import './App.css';

// 路由配置数据
const navItems = [
  { path: '/test', label: '测试页面', element: <TestPage /> },
  { path: '/', label: '时间戳', element: <TimestampPage /> },
  { path: '/record-replay', label: '录制', element: <RecordReplayPage /> },
  { path: '/replay-list', label: '历史回放', element: <ReplayListPage /> },
];

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
          <Route path="/replay/:id" element={<ReplayPlayerPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
