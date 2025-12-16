/**
 * 模块管理器
 */
class ModuleManager {
  constructor() {
    this.modules = new Map();
    this.pageModules = {
      home: {loaded: false, controller: null},
      settings: {loaded: false, controller: null},
      history: {loaded: false, controller: null},
      about: {loaded: false, controller: null},
      timestamp: {loaded: false, controller: null},
    };
  }

  async loadPageModule(pageName, context) {
    // 如果模块已加载，直接返回控制器
    if (this.pageModules[pageName].loaded &&
        this.pageModules[pageName].controller) {
      console.log(`页面 ${pageName} 模块已缓存，直接返回`);
      return this.pageModules[pageName].controller;
    }

    try {
      console.log(`开始加载页面 ${pageName} 模块`);

      // 动态导入模块
      const modulePath = `./pages/js/${pageName}.js`;
      let module;

      try {
        module = await import(modulePath);
      } catch (importError) {
        console.error(`导入模块 ${modulePath} 失败:`, importError);
        throw new Error(`无法导入页面模块: ${pageName}`);
      }

      // 获取模块的默认导出
      const moduleInit = module.default || module;

      if (typeof moduleInit !== 'function') {
        throw new Error(`模块 ${pageName} 的默认导出不是函数`);
      }

      console.log(`初始化页面 ${pageName} 模块...`);

      // 初始化模块并获取控制器
      const controller = await moduleInit(context);

      if (!controller || typeof controller !== 'object') {
        console.warn(`页面 ${pageName} 模块未返回有效控制器`);
      }

      // 缓存模块
      this.pageModules[pageName] = {
        loaded: true,
        controller: controller,
      };

      console.log(`成功加载 ${pageName} 模块`);
      return controller;
    } catch (error) {
      console.error(`加载 ${pageName} 模块失败:`, error);

      // 返回一个空控制器，避免后续错误
      return {
        destroy: () => {
          console.log(`销毁 ${pageName} 空控制器`);
        },
      };
    }
  }

  getPageModule(pageName) {
    return this.pageModules[pageName]?.controller || null;
  }

  cleanupPageModule(pageName) {
    const module = this.pageModules[pageName];
    if (module && module.controller) {
      try {
        if (typeof module.controller.destroy === 'function') {
          module.controller.destroy();
        }
      } catch (error) {
        console.error(`销毁 ${pageName} 模块时出错:`, error);
      }

      // 标记为未加载，但保留控制器引用以便重用
      module.loaded = false;

      console.log(`已清理 ${pageName} 模块`);
    }
  }

  cleanupAllModules() {
    Object.keys(this.pageModules).forEach((pageName) => {
      this.cleanupPageModule(pageName);
    });
  }
}

export default ModuleManager;
