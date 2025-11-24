import {
  RouteUtils,
  addClass,
  removeClass,
  hasClass,
  getParamsUrl,
  closure,
  genKey,
} from '../utils/routeUtils.js';
class Router {
  constructor() {
    // 路由表
    this.routes = {};
    // 路由跳转前执行
    this.beforeFun = null;
    // 路由跳转后执行
    this.afterFun = null;
    // 路由挂载点
    this.routerViewId = 'router-view';
    // 路由重定向hash
    this.redirectRoute = null;
    // 多级页面缓存
    this.stackPages = true;
    // 路由遍历
    this.routerMap = [];
    // 路由状态
    this.historyFlag = '';
    // 路由历史
    this.history = [];
    // 动画名称
    this.animationName = 'fade';
  }

  init(config) {
    this.routerMap = config ? config.routers : this.routerMap;
    this.routerViewId = config ? config.routerViewId : this.routerViewId;
    this.stackPages = config ? config.stackPages : this.stackPages;

    if (!this.routerMap.length) {
      let selector = this.routerViewId + '.page';
      let pages = document.querySelectorAll(selector);
      for (let i = 0; i < pages.length; i++) {
        let page = pages[i];
        let hash = page.getAttribute('hash');
        let name = hash.substring(1);
        this.routerMap.push({
          name: name,
          path: hash,
          callback: closure(name),
        });
      }
    }

    window.linkTo = (path) => {
      console.log('path', path);
      if (path.indexOf('?') !== -1) {
        window.location.hash = path + '&key=' + genKey();
      } else {
        window.location.hash = path + '?key=' + genKey();
      }
    };

    window.addEventListener(
      'load',
      function (event) {
        this.historyChange(event);
      },
      false
    );
  }

  /**
   * 路由历史纪录变化
   * @param {*} event
   */
  historyChange(event) {
    const currentHash = getParamsUrl();
    const nameString = 'router-' + this.routerViewId + '-history';
    this.history = window.sessionStorage[nameString]
      ? JSON.parse(window.sessionStorage[nameString])
      : [];

    let back = false,
      refresh = false,
      forward = false,
      index = 0,
      len = this.history.length;

    for (let i = 0; i < len; i++) {
      let h = this.history[i];
      if (h.hash === currentHash.path && h.key === currentHash.query.key) {
        index = i;
        if (i === len - 1) {
          refresh = true;
        } else {
          back = true;
        }
        break;
      } else {
        forward = true;
      }
    }

    if (back) {
      this.historyFlag = 'back';
      this.history.length = index + 1;
    } else if (refresh) {
      this.historyFlag = 'refresh';
    } else {
      this.historyFlag = 'forward';
      this.history.push({
        key: currentHash.query.key,
        hash: currentHash.path,
        query: currentHash.query,
      });
    }

    console.log('historyFlag', this.historyFlag);

    if (!this.stackPages) {
      this.historyFlag = 'forward';
    }
    window.sessionStorage[nameString] = JSON.stringify(this.history);
    this.urlChange();
  }

  changeView(currentHash) {
    const pages = document.querySelectorAll('.page');
    const previousPage = document.querySelector('.' + this.routerViewId + ' .page.active');
    let currentPage = null;
    let currentHash = null;

    for (let i = 0; i < pages.length; i++) {
      let page = pages[i];
      let hash = page.getAttribute('hash');
      page.setAttribute('class', 'page');
      if (hash === currentHash.path) {
        currentHash = hash;
        currentPage = page;
      }
    }

    const enterName = 'enter-' + this.animationName;
    const leaveName = 'leave-' + this.animationName;

    if (this.historyFlag === 'back') {
      addClass(currentPage, 'current');
      if (previousPage) {
        addClass(previousPage, leaveName);
      }

      setTimeout(() => {
        if (previousPage) {
          removeClass(previousPage, leaveName);
        }
      }, 300);
    } else if (this.historyFlag === 'forward' || this.historyFlag === 'refresh') {
      if (previousPage) {
        addClass(previousPage, leaveName);
      }
      addClass(currentPage, enterName);
      setTimeout(() => {
        if (previousPage) {
          removeClass(previousPage, leaveName);
        }
        addClass(currentPage, enterName);
        removeClass(currentPage, 'current');
      }, 300);
      currentPage.scrollTop = 0;
      this.routes[currentHash].callback ? this.routes[currentHash].callback() : null;
    }

    this.afterFun ? this.afterFun(currentHash) : null;
  }

  urlChange() {
    const currentHash = getParamsUrl();
    if (this.routes[currentHash.path]) {
      if (this.beforeFun) {
        this.beforeFun({
          to: {
            path: currentHash.path,
            query: currentHash.query,
          },
          next: () => {
            this.changeView(currentHash);
          },
        });
      } else {
        this.changeView(currentHash);
      }
    } else {
      location.hash = this.redirectRoute;
    }
  }

  map() {
    for (let i = 0; i < this.routerMap.length; i++) {
      let route = this.routerMap[i];
      if (route.name === 'redirect') {
        this.redirectRoute = route.path;
      } else {
        this.redirectRoute = this.routerMap[0].path;
      }

      let newPath = route.path;
      let path = newPath.repalce(/\s+/g, '');
      this.routes[path] = {
        callback: route.callback,
      };
    }
  }

  beforeEach(callback) {
    if (Object.prototype.toString.call(callback) === '[object Function]') {
      this.beforeFun = callback;
    } else {
      console.trace('beforeEach callback must be a function');
    }
  }

  afterEach(callback) {
    if (Object.prototype.toString.call(callback) === '[object Function]') {
      this.afterFun = callback;
    } else {
      console.trace('afterEach callback must be a function');
    }
  }
}
