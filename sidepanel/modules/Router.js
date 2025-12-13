class Router {
  constructor() {
    this.routes = {};
    this.beforeFun = null;
    this.afterFun = null;
    this.routerViewId = 'app';
    this.redirectRoute = '/';
    this.stackPages = true;
    this.routerMap = [];

    this.scriptManager = window.scriptManager;

    // 页面实例
    this.currentinstance = null;
  }

  /**
   * 初始化路由
   */
  init(config) {
    // 配置路由
    this.routerMap = config?.routes || this.routerMap;
    this.routerViewId = config?.routerViewId || this.routerViewId;
    this.stackPages = config?.stackPages ?? this.stackPages;
    this.redirectRoute = config?.redirectRoute || this.redirectRoute;
    this.map();

    // 监听路由变化
    window.addEventListener('hashchange', () => this.urlChange());
    window.addEventListener('load', () => this.urlChange());
    window.lintTo = (path) => this.navigate(path);
  }

  map() {
    if (!this.routerMap.length) {
      console.error('请配置路由');
      return;
    }

    for (const r of this.routerMap) {
      if (r.name === 'redirect') this.redirectRoute = r.path;
      this.routes[r.path] = r;
    }
  }

  /**
   * 导航
   */
  navigate(path) {
    window.location.hash = path;
  }

  /**
   * 路由解析与渲染
   */
  urlChange() {
    const path = location.hash.replace('#', '') || this.redirectRoute;
    const route = this.routes[path];

    if (!route) {
      // 当前路由不存在时，返回到设置的重定向页面
      location.hash = this.redirectRoute;
      return;
    }

    const doChange = async () => {
      if (this.currentinstance && typeof this.currentinstance.destroy === 'function') {
        console.log(`销毁旧组件${this.currentRoute.name}`);
        this.currentinstance.destroy();
        this.currentinstance = null;
      }

      const mount = document.getElementById(this.routerViewId);
      if (!mount) {
        console.error('挂载点不存在:', this.routerViewId);
        return;
      }
      if (!this.stackPages) mount.innerHTML = '';
      if (route.html) {
        try {
          mount.innerHTML = await fetch(route.html).then((r) => r.text());
        } catch (e) {
          mount.innerHTML = `<h2>页面加载失败：${e.message}</h2>`;
        }
      }

      if (route.script) {
        await this.scriptManager.loadScript({
          path: route.script,
          name: route.name,
          isModule: route.isModule,
          deps: route.deps,
        });
      }

      const newInstance = await this.scriptManager.getComponentInstance(route.name);
      console.log(newInstance);
      if (newInstance) {
        this.currentinstance = newInstance;
        if (typeof newInstance.init === 'function') {
          newInstance.init();
        }
      }

      this.currentRoute = route;
      if (this.afterFun) this.afterFun(route);
    };

    if (this.beforeFun) {
      this.beforeFun({ to: route, next: doChange });
    } else {
      doChange().then(r => r);
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
