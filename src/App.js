import {HashRouter as Router, Routes, Route} from 'react-router-dom';
import ActionsPage from './pages/ActionsPage';
import TimestampPage from './pages/TimestampPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<TimestampPage/>}/>
          <Route path="/actions" element={<ActionsPage/>}/>
          <Route path="/timestamp" element={<TimestampPage/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
