export class BaseComponent {
  constructor() {
    this._timerManager = window.timerManager;
    this._scriptManager = window.scriptManager;
    this._eventManager = window.eventManager;
  }

  /**
   * 安全绑定事件，并自动记录以记录销毁
   * @param {string | HTMLElement} target 目标元素
   * @param {string} type 事件类型
   * @param {Function} handler 回调函数
   */
  bindEvent(target, type, handler) {

    console.log('Bind 1111;')
    // 获取目标元素
    const ele = typeof target === 'string' ? document.getElementById(target) : target;

    if (!ele) {
      console.error(`Element with ID ${target} not found.`);
      return;
    }

    ele.addEventListener(type, handler);

    this._eventManager.add(ele, type, handler);
  }

  /**
   * 创建定时器
   * @param {Function} fn 定时器回调函数
   * @param {number} ms 定时器间隔时间（毫秒）
   */
  setInterval(fn, ms) {
    this._timerManager.setInterval(fn, ms);
  }

  /**
   * 创建定时器
   * @param {Function} fn 定时器回调函数
   * @param {number} ms 定时器间隔时间（毫秒）
   */
  setTimeout(fn, ms) {
    this._timerManager.setTimeout(fn, ms);
  }

  /**
   * 加载脚本
   * @param {string} path 脚本路径
   * @param {string} name 脚本名称
   * @param {boolean} isModule 是否为模块
   * @param {string[]} deps 依赖的脚本
   */
  loadScript(path, name, isModule = false, deps = []) {
    this._scriptManager.loadScript({path, name, isModule, deps});
  }

  /**
   * 销毁组件
   */
  destroy() {
    this._eventManager.removeAll();
    this._timerManager.cleanAll();
    this._scriptManager.unloadScript().then(r => console.log(r));
    console.log('destroy success');
  }
}

window.BaseComponent = BaseComponent;
