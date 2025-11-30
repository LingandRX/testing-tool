import { getParamsUrl, closure, genKey } from '../utils/routeUtils.js';
import { addClass, removeClass } from '../utils/domUtils.js';
import { loadScript } from '../utils/scriptLoader.js';

class Router {
  constructor() {
    this.routes = {};
    this.beforeFun = null;
    this.afterFun = null;
    this.routerViewId = 'router-view';
    this.redirectRoute = null;
    this.stackPages = true;
    this.routerMap = [];
    this.historyFlag = '';
    this.history = [];
  }

  /**
   * 初始化路由
   */
  init(config) {
    this.routerMap = config?.routes || this.routerMap;
    this.routerViewId = config?.routerViewId || this.routerViewId;
    this.stackPages = config?.stackPages ?? this.stackPages;

    // 映射路由表
    this.map();

    window.linkTo = (path) => {
      if (path.includes('?')) {
        location.hash = `${path}&key=${genKey()}`;
      } else {
        location.hash = `${path}?key=${genKey()}`;
      }
    };

    window.addEventListener('load', (e) => {
      this.historyChange(e);
      this.updateActiveButton(e);
    });
    window.addEventListener('hashchange', (e) => {
      this.historyChange(e);
      this.updateActiveButton(e);
    });
  }

  async loadPage(route) {
    console.log('加载页面：', route);
    const html = await fetch(route.html).then((r) => r.text());
    document.getElementById(this.routerViewId).innerHTML = html;

    const initName = route.name + 'Init';
    await loadScript(route.script, initName);

    if (window[initName] && route.script) {
      await window[initName]();
    }
  }

  /**
   * 加载 HTML 文件
   */
  async loadHTML(htmlPath) {
    try {
      const resp = await fetch(htmlPath);
      if (!resp.ok) throw new Error(`HTML 加载失败: ${resp.status}`);
      return await resp.text();
    } catch (err) {
      return `<h2>页面加载失败：${err.message}</h2>`;
    }
  }

  /**
   * 处理路由历史变化
   */
  historyChange(event) {
    const { path, query } = getParamsUrl();
    console.log('路由变化page{}, query{}', path, query);
    this.urlChange();
  }

  /**
   * 路由解析与渲染
   */
  urlChange() {
    const currentHash = getParamsUrl();
    const { path, query } = currentHash;

    if (!this.routes[path]) {
      location.hash = this.redirectRoute;
      return;
    }

    const next = () => this.changeView(currentHash);

    if (this.beforeFun) {
      this.beforeFun({ to: { path, query }, next });
    } else {
      next();
    }
  }

  /**
   * 渲染页面
   */
  async changeView(currentHash) {
    const { path } = currentHash;
    const route = await this.routes[path];
    const mountEl = document.getElementById(this.routerViewId);

    if (!mountEl) {
      console.error('挂载点不存在:', this.routerViewId);
      return;
    }

    console.log('路由：', route);
    this.loadPage(route);

    // 执行 after 钩子
    if (this.afterFun) this.afterFun(currentHash);
  }

  /**
   * 构建路由映射
   */
  map() {
    for (let r of this.routerMap) {
      if (r.name === 'redirect') {
        this.redirectRoute = r.path;
      } else if (!this.redirectRoute) {
        this.redirectRoute = this.routerMap[0].path;
      }

      this.routes[r.path] = {
        name: r.name,
        html: r.html,
        script: r.script,
      };
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

  updateActiveButton(event) {
    const currentRoute = location.hash.replace('#', '') || '/home';

    document.querySelectorAll('[data-route]').forEach((btn) => {
      const route = btn.getAttribute('data-route');
      if (route === currentRoute) {
        console.log('当前路由：', route);
        addClass(btn, 'active');
      } else {
        removeClass(btn, 'active');
      }
    });
  }
}

export { Router };
