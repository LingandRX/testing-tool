/**
 * 主应用程序
 */
import StateManager from './state-manager.js';
import ModuleManager from './module-manager.js';

class App {
  constructor() {
    this.stateManager = new StateManager();
    this.moduleManager = new ModuleManager();
    this.currentPage = null;
    this.currentIframe = null;
    this.pageControllers = new Map();
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.setupEventListeners();
      this.setupStateSubscription();
      this.stateManager.incrementUsage();
    });
  }

  setupEventListeners() {
    // 等待DOM完全加载后再绑定事件
    setTimeout(() => {
      document.querySelectorAll('.nav-button').forEach((button) => {
        button.addEventListener('click', (e) => {
          const page = e.currentTarget.getAttribute('data-page');
          this.stateManager.navigateTo(page);
        });
      });
    }, 100);
  }

  setupStateSubscription() {
    this.stateManager.subscribe(async (state) => {
      await this.render(state);
    });
  }

  async render(state) {
    this.updateNavigation(state.currentPage);
    await this.loadPage(state.currentPage, state);
  }

  updateNavigation(currentPage) {
    document.querySelectorAll('.nav-button').forEach((button) => {
      const page = button.getAttribute('data-page');
      button.classList.toggle('active', page === currentPage);
    });
  }

  async loadPage(pageName, state) {
    if (pageName === this.currentPage && this.currentIframe) {
      return;
    }

    this.showLoading();

    try {
      if (this.currentPage) {
        this.moduleManager.cleanupPageModule(this.currentPage);
        this.pageControllers.delete(this.currentPage);
      }

      this.currentPage = pageName;

      // 创建或获取iframe
      await this.setupIframe(pageName);

      // 等待iframe完全加载
      await new Promise((resolve) => {
        if (this.currentIframe.contentDocument.readyState === 'complete') {
          resolve();
        } else {
          this.currentIframe.onload = () => resolve();
        }
      });

      // 确保iframe内部DOM也完全加载
      await this.waitForIframeDOM(pageName);

      // 加载页面模块
      const controller = await this.loadPageModule(pageName, state);

      if (controller) {
        this.pageControllers.set(pageName, controller);
      }

      this.hideLoading();
    } catch (error) {
      console.error(`加载页面 ${pageName} 失败:`, error);
      this.showError(`加载页面失败: ${error.message}`);
      this.hideLoading();
    }
  }

  async setupIframe(pageName) {
    const container = document.getElementById('content-container');

    // 清理之前的 observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    clearTimeout(this.retryTimer);

    // 隐藏所有 iframe
    const existingIframes = container.querySelectorAll('.page-iframe');
    existingIframes.forEach(iframe => {
      iframe.style.display = 'none';
    });

    // 检查是否已存在该页面的 iframe
    let iframe = container.querySelector(`iframe[data-page="${pageName}"]`);

    if (!iframe) {
      // 创建新的 iframe
      iframe = document.createElement('iframe');
      iframe.className = 'page-iframe';
      iframe.setAttribute('data-page', pageName);
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');

      // 设置样式
      iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

      // 添加加载事件监听
      iframe.addEventListener('load', () => {
        console.log(`iframe ${pageName} load 事件触发`);

        // 确保 iframe 完全加载
        setTimeout(() => {
          if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
            console.log(`iframe ${pageName} 完全加载`);
            iframe.style.opacity = '1';
          }
        }, 100);
      });

      iframe.addEventListener('error', (error) => {
        console.error(`iframe ${pageName} 加载错误:`, error);
      });

      // 设置 src
      const pageUrl = chrome.runtime.getURL(`pages/${pageName}.html`);
      console.log(`加载页面: ${pageUrl}`);
      iframe.src = pageUrl;

      container.appendChild(iframe);

      // 等待 iframe 创建完成
      await new Promise(resolve => setTimeout(resolve, 50));
    } else {
      // 显示已存在的 iframe
      iframe.style.display = 'block';
      iframe.style.opacity = '1';
    }

    this.currentIframe = iframe;

    // 如果 iframe 已经加载完成，直接触发加载逻辑
    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
      console.log(`iframe ${pageName} 已缓存，直接使用`);
    }
  }

  /**
   * 等待 iframe DOM 完全加载
   * @param {string} pageName - 页面名称
   * @returns {Promise} 加载完成的 Promise
   */
  waitForIframeDOM(pageName) {
    return new Promise((resolve, reject) => {
      const timeout = 10000; // 10秒超时
      const startTime = Date.now();

      const checkDOM = () => {
        // 检查超时
        if (Date.now() - startTime > timeout) {
          console.error(`等待 ${pageName} DOM 超时`);
          reject(new Error(`加载页面 ${pageName} 超时`));
          return;
        }

        // 检查 iframe 是否存在
        if (!this.currentIframe || !this.currentIframe.contentDocument) {
          console.log(`等待 ${pageName} iframe 文档...`);
          setTimeout(checkDOM, 100);
          return;
        }

        const iframeDoc = this.currentIframe.contentDocument;

        // 检查文档状态
        if (iframeDoc.readyState !== 'complete' && iframeDoc.readyState !== 'interactive') {
          console.log(`等待 ${pageName} 文档状态: ${iframeDoc.readyState}`);
          setTimeout(checkDOM, 100);
          return;
        }

        // 检查关键元素
        const requiredElements = this.getRequiredElementsForPage(pageName);
        const missingElements = [];

        requiredElements.forEach(selector => {
          const element = iframeDoc.querySelector(selector);
          if (!element) {
            missingElements.push(selector);
          }
        });

        if (missingElements.length === 0) {
          console.log(`页面 ${pageName} DOM 已完全加载`);

          // 额外等待 100ms 确保 CSS 和脚本已执行
          setTimeout(resolve, 100);
        } else {
          console.log(`等待页面 ${pageName} DOM 元素... 缺失:`, missingElements);

          // 使用 MutationObserver 监听 DOM 变化
          if (!this.observer) {
            this.observer = new MutationObserver(() => {
              clearTimeout(this.retryTimer);
              this.retryTimer = setTimeout(checkDOM, 50);
            });

            this.observer.observe(iframeDoc.body, {
              childList: true,
              subtree: true
            });
          }

          // 设置重试定时器
          clearTimeout(this.retryTimer);
          this.retryTimer = setTimeout(checkDOM, 100);
        }
      };

      checkDOM();
    });
  }

  /**
   * 获取页面必需的元素选择器
   */
  getRequiredElementsForPage(pageName) {
    const selectors = {
      'home': ['#current-date'],
      'settings': ['#dark-mode', '#save-settings'],
      'history': ['#history-list', '#clear-history'],
      'about': ['#visit-website']
    };

    // 默认返回基础选择器，确保页面有内容
    const defaultSelectors = ['body', 'h1'];
    return [...(selectors[pageName] || []), ...defaultSelectors];
  }

  async loadPageModule(pageName, state) {
    try {
      const context = {
        stateManager: this.stateManager,
        showNotification: this.showNotification.bind(this),
        iframeWindow: this.currentIframe.contentWindow,
        iframeDocument: this.currentIframe.contentDocument,
        state: state,
      };

      return await this.moduleManager.loadPageModule(pageName, context);
    } catch (error) {
      console.error(`加载模块 ${pageName} 失败:`, error);
      return null;
    }
  }

  showLoading() {
    const container = document.getElementById('content-container');

    let loadingOverlay = container.querySelector('.loading-overlay');
    if (!loadingOverlay) {
      loadingOverlay = document.createElement('div');
      loadingOverlay.className = 'loading-overlay';
      loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
      container.appendChild(loadingOverlay);
    }

    loadingOverlay.style.display = 'flex';
  }

  hideLoading() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.style.display = 'none';
    }
  }

  showError(message) {
    const container = document.getElementById('content-container');

    const existingError = container.querySelector('.error-overlay');
    if (existingError) existingError.remove();

    const errorOverlay = document.createElement('div');
    errorOverlay.className = 'loading-overlay error-overlay';
    errorOverlay.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 48px; color: #fa5252;">⚠️</div>
        <h3 style="color: #fa5252; margin: 10px 0;">加载失败</h3>
        <p style="color: #868e96;">${message}</p>
        <button id="retry-loading" style="margin-top: 15px;">重试</button>
      </div>
    `;

    container.appendChild(errorOverlay);

    errorOverlay.querySelector('#retry-loading').addEventListener('click', () => {
      errorOverlay.remove();
      this.stateManager.navigateTo(this.currentPage);
    });
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4dabf7;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// 添加CSS动画
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
});

// 启动应用
new App();
