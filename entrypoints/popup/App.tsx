// App.js
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import TimestampPage from './pages/TimestampPage';
import RecordeReplayPage from './pages/RecordeReplayPage';
import Navbar from './components/Navbar';
import RoutePersistence from './components/RoutePersistence';
import './App.css';

// 路由配置数据
const navItems = [
  { path: '/', label: '时间戳', element: <TimestampPage /> },
  // {path: '/dzmy', label: '电子木鱼', element: <ElectronicWoodenFishPage/>},
  { path: '/recorde-replay', label: '录制与回放', element: <RecordeReplayPage /> },
];

const theme = createTheme();

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <RoutePersistence />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Navbar items={navItems} />
          <Routes>
            {navItems.map((item) => (
              <Route key={item.path} path={item.path} element={item.element} />
            ))}
          </Routes>
        </SnackbarProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
