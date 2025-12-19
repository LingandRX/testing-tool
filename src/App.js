import {HashRouter as Router, Routes, Route, NavLink} from 'react-router-dom';
import TimestampPage from './pages/TimestampPage';
import ElectronicWoodenFishPage from "./pages/ElectronicWoodenFishPage";
import './App.css';

function App() {
  return (<Router>
    
    <div className="app">
      <nav className="nav">
        <ul className="nav-list">
          <li><NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Timestamp</NavLink></li>
          <li><NavLink to="/dzmy" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>电子木鱼</NavLink></li>
        </ul>
      </nav>
      
      <Routes>
        <Route path="/" element={<TimestampPage/>}/>
        <Route path="/timestamp" element={<TimestampPage/>}/>
        <Route path="/dzmy" element={<ElectronicWoodenFishPage/>}/>
      </Routes>
    </div>
  </Router>);
}

export default App;
