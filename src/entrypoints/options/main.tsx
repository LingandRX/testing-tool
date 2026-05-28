import ReactDOM from 'react-dom/client';
import AppRoot from '@/providers/AppRoot';
import '@/index.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AppRoot>
    <App />
  </AppRoot>,
);
