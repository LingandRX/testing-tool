import ReactDOM from 'react-dom/client';
import { applyThemeFromSnapshot } from '@/utils/themeSnapshot';
import AppRoot from '@/providers/AppRoot';
import '@/index.css';
import App from './App.tsx';

applyThemeFromSnapshot();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AppRoot>
    <App />
  </AppRoot>,
);
