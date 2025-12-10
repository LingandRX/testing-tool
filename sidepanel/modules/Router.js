import { TimerManager } from '../utils/timerManager.js';
import { EventManager } from '../utils/eventManager.js';
import { ScriptManager } from '../utils/scriptManager.js';

class Router {
  constructor() {
    this.routes = {};
    this.beforeFun = null;
    this.afterFun = null;
    this.routerViewId = 'app';
    this.redirectRoute = null;
    this.stackPages = true;
    this.routerMap = [];
    this.historyFlag = '';
    this.history = [];
    this.scriptManager = window.scriptManager;
    this.eventManager = window.eventManager;
    this.timerManager = window.timerManager;
  }

  /**
   * 初始化路由
   */
  init(config) {
    // 配置路由
    this.routerMap = config?.routes || this.routerMap;
    this.routerViewId = config?.routerViewId || this.routerViewId;
    this.stackPages = config?.stackPages ?? this.stackPages;
    this.map();

    // 监听路由变化
    window.addEventListener('hashchange', () => this.urlChange());
    window.addEventListener('load', () => this.urlChange());
    window.lintTo = (path) => this.naviage(path);
  }

  map() {
    if (!this.routerMap.length) {
      console.error('请配置路由');
      return;
    }

    for (const r of this.routerMap) {
      if (r.name == 'redirect') this.redirectRoute = r.path;
      this.routes[r.path] = r;
    }
  }

  /**
   * 导航
   */
  naviage(path) {
    window.location.hash = path;
  }

  /**
   * 路由解析与渲染
   */
  urlChange() {
    const path = location.hash.replace('#', '') || this.redirectRoute;
    console.log('当前路由：', path);
    const route = this.routes[path];

    if (!route) {
      location.hash = this.redirectRoute;
      return;
    }

    const doChange = async () => {
      this.timerManager.cleanAll();
      this.eventManager.removeAll();

      const mount = document.getElementById(this.routerViewId);
      if (!mount) {
        console.error('挂载点不存在:', this.routerViewId);
        return;
      }

      if (!this.stackPages) mount.innerHTML = '';

      if (route.html) {
        try {
          const html = await fetch(route.html).then((r) => r.text());
          mount.innerHTML = html;
        } catch (e) {
          mount.innerHTML = `<h2>页面加载失败：${e.message}</h2>`;
        }
      }

      console.log('当前组件：', route.script);
      if (route.script) {
        await this.scriptManager.loadScript({
          path: route.script,
          name: route.name,
          isModule: route.isModule,
          deps: route.deps,
        });
      }

      console.log('当前组件：', route.name);
      await this.scriptManager.runInit(route.name);

      this.currentRoute = route;
      if (this.afterFun) this.afterFun(route);
    };

    if (this.beforeFun) {
      this.beforeFun({ to: route, next: doChange });
    } else {
      doChange();
    }
  }

  /**
   * before 钩子
   */
  beforeEach(callback) {
    if (typeof callback === 'function') {
      this.beforeFun = callback;
    } else {
      console.trace('beforeEach 必须是函数');
    }
  }

  /**
   * after 钩子
   */
  afterEach(callback) {
    if (typeof callback === 'function') {
      this.afterFun = callback;
    } else {
      console.trace('afterEach 必须是函数');
    }
  }
}

export { Router };
