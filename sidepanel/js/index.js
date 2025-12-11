import {ScriptManager} from './utils/scriptManager.js';
import {TimerManager} from './utils/timerManager.js';
import {EventManager} from './utils/eventManager.js';
import {Router} from '../modules/Router.js';

const config = {
  routerViewId: 'app',
  stackPages: false,
  routes: [
    {
      path: '/',
      name: 'timestamp',
      html: 'pages/timestamp.html',
      script: '../dist/timestamp.js',
    },
    {
      path: '/home',
      name: 'timestamp',
      html: 'pages/timestamp.html',
      script: '../dist/timestamp.js',
    },
    {
      path: '/todo',
      name: 'todo',
      html: 'pages/todolist.html',
    },
  ],
};

// 注入脚本管理器
window.scriptManager = new ScriptManager();
// 注入定时器管理器
window.timerManager = new TimerManager();
// 注入事件管理器
window.eventManager = new EventManager();

const router = new Router();
router.init(config);

// click delegation
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-route]');
  if (!btn) return;
  const p = btn.getAttribute('data-route');
  location.hash = p;
  // update active styling
  document.querySelectorAll('[data-route]').forEach((b) => b.classList.toggle('active', b === btn));
});
