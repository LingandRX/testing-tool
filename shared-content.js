/**
 * 共享上下文管理器
 * 负责在主框架和页面之间共享模块和状态
 */
class SharedContext {
  constructor() {
    this.modules = new Map();
    this.init();
  }

  /**
   * 初始化共享上下文
   */
  init() {
    // 预加载常用模块
    this.loadSharedModules();

    // 设置全局访问点
    if (typeof window !== 'undefined') {
      window.__extensionSharedContext = this;
    }
  }

  /**
   * 加载共享模块
   */
  async loadSharedModules() {
    try {
      // 加载工具模块
      const utilsModule = await import('./libs/utils.js.js');
      this.registerModule('utils.js', utilsModule.default || utilsModule);

      // 加载API客户端
      const apiClientModule = await import('./libs/api-client.js');
      this.registerModule('apiClient', apiClientModule.default || apiClientModule);

      // 加载常量
      const constantsModule = await import('./libs/constants.js');
      this.registerModule('constants', constantsModule.default || constantsModule);

      console.log('共享模块加载完成');
    } catch (error) {
      console.error('加载共享模块失败:', error);
    }
  }

  /**
   * 注册模块
   * @param {string} name - 模块名称
   * @param {any} module - 模块对象
   */
  registerModule(name, module) {
    this.modules.set(name, module);
  }

  /**
   * 获取模块
   * @param {string} name - 模块名称
   * @returns {any} 模块对象
   */
  getModule(name) {
    return this.modules.get(name);
  }

  /**
   * 获取所有模块
   * @returns {Object} 所有模块的映射
   */
  getAllModules() {
    const modules = {};
    this.modules.forEach((value, key) => {
      modules[key] = value;
    });
    return modules;
  }

  /**
   * 注入到iframe
   * @param {Window} iframeWindow - iframe的window对象
   */
  injectToIframe(iframeWindow) {
    if (iframeWindow && iframeWindow.document) {
      // 注入共享上下文引用
      iframeWindow.__extensionSharedContext = this;

      // 注入全局访问方法
      iframeWindow.getSharedModule = (name) => this.getModule(name);
      iframeWindow.getAllSharedModules = () => this.getAllModules();

      console.log('共享上下文已注入到iframe');
    }
  }

  /**
   * 清理上下文
   */
  cleanup() {
    this.modules.clear();
    if (typeof window !== 'undefined' && window.__extensionSharedContext) {
      delete window.__extensionSharedContext;
    }
  }
}

// 创建单例
const sharedContext = new SharedContext();

export default sharedContext;