import ReactDOM from 'react-dom/client';
import AppRoot from '@/providers/AppRoot';
import '@/styles/shell.css';
import App from './App.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AppRoot>
    <App />
  </AppRoot>,
);
