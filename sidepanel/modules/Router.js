import { getParamsUrl, closure, genKey } from '../utils/routeUtils.js';

import { addClass, removeClass, hasClass } from '../utils/domUtils.js';
// var config = {
//     routerViewId: '#routerView', // 路由切换的挂载点 id
//     stackPages: true, // 多级页面缓存
//     animationName: "slide", // 多级页面缓存
//     routes: [
//         // {
//         //   path: "/home",
//         //   name: "home",
//         //   callback: function(transition) {
//         //       home()
//         //   }
//         // }
//     ]
// }
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
    this.routerMap = config ? config.routes : this.routerMap;
    this.routerViewId = config ? config.routerViewId : this.routerViewId;
    this.stackPages = config ? config.stackPages : this.stackPages;

    const name = document.querySelector('#app').getAttribute('data-animationName');
    if (name) {
      this.animationName = name;
    }
    this.animationName = config ? config.animationName : this.animationName;

    this.map();

    if (!this.routerMap.length) {
      // 找到routerViewId 节点下的所有page 节点
      const pages = document.querySelectorAll(this.routerViewId + ' .page');
      for (let i = 0; i < pages.length; i++) {
        // 遍历所有的page节点
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

    window.addEventListener('load', (event) => {
      this.historyChange(event);
    });

    window.addEventListener('hashchange', (event) => {
      this.historyChange(event);
    });
  }

  /**
   * 路由历史纪录变化
   * @param {*} event
   */
  historyChange(event) {
    // {path, query, params}
    const currentHash = getParamsUrl();
    // router-#app-history
    const nameString = 'router-' + this.routerViewId + '-history';

    this.history = window.sessionStorage[nameString]
      ? JSON.parse(window.sessionStorage[nameString])
      : [];

    // 返回上一级
    let back = false;
    // 刷新页面
    let refresh = false;
    // 前进上一级
    let forward = false;
    // 获取当前路由的索引
    let index = 0;

    for (let i = 0; i < this.history.length; i++) {
      let h = this.history[i];

      // 判断是否是当前路由
      if (h.hash === currentHash.path && h.key === currentHash.query.key) {
        // 获取当前路由的索引
        index = i;
        // 判断是否是刷新页面
        if (i === this.history.length - 1) {
          refresh = true;
        } else {
          // 判断是否是返回上一级
          back = true;
        }
        break;
      } else {
        // 判断是否是前进
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

  /**
   * 更改页面
   * @param {*} currentHash
   */
  changeView(currentHash) {
    const pages = document.querySelectorAll(' .page');
    const previousPage = document.querySelector('.' + this.routerViewId + ' .page.active');
    let currentPage = null;
    let currHash = null;

    for (let i = 0; i < pages.length; i++) {
      let page = pages[i];
      let hash = page.getAttribute('hash');
      page.setAttribute('class', 'page');
      if (hash === currentHash.path) {
        currHash = hash;
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
      this.routes[currHash].callback ? this.routes[currHash].callback() : null;
    }

    this.afterFun ? this.afterFun(currentHash) : null;
  }

  /**
   * url改变
   */
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

  /**
   * 映射路由
   */
  map() {
    for (let i = 0; i < this.routerMap.length; i++) {
      let route = this.routerMap[i];
      if (route.name === 'redirect') {
        this.redirectRoute = route.path;
      } else {
        this.redirectRoute = this.routerMap[0].path;
      }

      let newPath = route.path;
      let path = newPath.replace(/\s+/g, '');
      this.routes[path] = {
        callback: route.callback,
      };
    }
  }

  /**
   *  切换页面前的hook
   * @param {*} callback hook执行函数
   */

  beforeEach(callback) {
    if (Object.prototype.toString.call(callback) === '[object Function]') {
      // 判断callback是否为函数
      this.beforeFun = callback;
    } else {
      // 抛出错误
      console.trace('beforeEach callback must be a function');
    }
  }

  /**
   *  切换页面后的hook
   * @param {*} callback hook执行函数
   */

  afterEach(callback) {
    if (Object.prototype.toString.call(callback) === '[object Function]') {
      // 判断callback是否为函数
      this.afterFun = callback;
    } else {
      // 抛出错误
      console.trace('afterEach callback must be a function');
    }
  }
}

export { Router };
