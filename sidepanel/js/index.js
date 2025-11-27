console.log('Before creating router');
import { Router } from '../modules/Router.js';

import * as PageModules from '../../dist/timestamp.js';

const config = {
  routerViewId: 'app', // 路由切换的挂载点 id
  stackPages: false, // 多级页面缓存
  animationName: 'fade', // 切换页面时的动画
  routes: [
    {
      path: '/home',
      name: 'home',
      callback: async () => {
        // 1. 加载 HTML
        const html = await fetch('pages/timestamp.html').then((r) => r.text());
        document.getElementById('home').innerHTML = html;

        // 2. 动态加载对应 JS
        const script = document.createElement('script');
        script.src = '/dist/timestamp.js'; // IIFE 打包后的文件
        script.onload = () => {
          // 3. 执行 IIFE 暴露的全局对象方法
          TimestampPage.init(); // 假设 timestamp.js 输出 name: 'TimestampPage'
        };
        document.body.appendChild(script);
      },
    },
    {
      path: '/todo',
      name: 'todo',
      callback: async () => {
        // 1. 加载 HTML
        const html = await fetch('pages/todolist.html').then((r) => r.text());
        document.getElementById('todo').innerHTML = html;

        // 2. 动态加载对应 JS
        const script = document.createElement('script');
        script.src = '/dist/timestamp.js'; // IIFE 打包后的文件
        script.onload = () => {
          // 3. 执行 IIFE 暴露的全局对象方法
          TimestampPage.init(); // 假设 timestamp.js 输出 name: 'TimestampPage'
        };
        document.body.appendChild(script);
      },
    },
  ],
};

const router = new Router();
console.log('Router created:', router);
router.init(config);
console.log('Router initialized');

document.getElementById('todo-jump').addEventListener('click', () => {
  console.log('Jumping to todo page');
  window.linkTo('#/todo');
});
