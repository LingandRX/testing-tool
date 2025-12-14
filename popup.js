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

    // 移除所有现有的iframe
    const existingIframes = container.querySelectorAll('.page-iframe');
    existingIframes.forEach((iframe) => {
      iframe.style.display = 'none';
    });

    // 检查是否已存在该页面的iframe
    let iframe = container.querySelector(`iframe[data-page="${pageName}"]`);

    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.className = 'page-iframe';
      iframe.setAttribute('data-page', pageName);
      iframe.src = chrome.runtime.getURL(`pages/${pageName}.html`);
      container.appendChild(iframe);

      // 添加加载完成的监听器
      iframe.addEventListener('load', () => {
        console.log(`iframe ${pageName} 加载完成`);
      });
    } else {
      iframe.style.display = 'block';
    }

    this.currentIframe = iframe;
  }

  waitForIframeDOM(pageName) {
    return new Promise((resolve) => {
      const checkDOM = () => {
        const iframeDoc = this.currentIframe.contentDocument;

        if (iframeDoc && iframeDoc.readyState === 'complete') {
          // 检查关键元素是否存在
          const testElements = this.getTestElementsForPage(pageName);
          const allExist = testElements.every(
              (selector) => iframeDoc.querySelector(selector));

          if (allExist) {
            console.log(`页面 ${pageName} DOM 已完全加载`);
            resolve();
          } else {
            console.log(`等待页面 ${pageName} DOM 元素...`);
            setTimeout(checkDOM, 50);
          }
        } else {
          setTimeout(checkDOM, 50);
        }
      };

      checkDOM();
    });
  }

  getTestElementsForPage(pageName) {
    const testSelectors = {
      home: ['#usage-count', '#test-action'],
      settings: ['#dark-mode', '#save-settings'],
      history: ['#history-list', '#clear-history'],
      about: ['#visit-website'],
      timestamptool: ['#current-timestamp-value'],
    };

    return testSelectors[pageName] || [];
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

    errorOverlay.querySelector('#retry-loading').
        addEventListener('click', () => {
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
