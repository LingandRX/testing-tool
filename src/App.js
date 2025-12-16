import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import UserListPage from './pages/UserListPage';
import ActionsPage from './pages/ActionsPage';
import TimestampPage from './pages/TimestampPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <h2>User Manager Extesion</h2>
        </nav>

        <Routes>
          <Route path="/" element={<UserListPage />} />
          <Route path="/actions" element={<ActionsPage />} />
          <Route path="/timestamp" element={<TimestampPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
