console.log('Before creating router');
import { Router } from '../modules/Router.js';

const config = {
  routerViewId: 'app',
  stackPages: false,
  routes: [
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
      script: '',
    },
  ],
};

const router = new Router();
console.log('Router created:', router);
router.init(config);
console.log('Router initialized');

document.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-route]');
  if (!btn) return;

  const path = btn.getAttribute('data-route');
  if (!path) return;

  // 触发 hash 路由跳转
  window.location.hash = path;
});
