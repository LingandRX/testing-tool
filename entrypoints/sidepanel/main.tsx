import ReactDOM from 'react-dom/client';
import AppRoot from '@/providers/AppRoot';
import '@/i18n';
import '@/src/index.css';
import App from './App.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AppRoot>
    <App />
  </AppRoot>,
);
