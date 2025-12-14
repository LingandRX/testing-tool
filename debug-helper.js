/**
 * 调试助手
 */
class DebugHelper {
  static logPageElements(document, pageName) {
    console.log(`=== 检查页面 ${pageName} 元素 ===`);

    const requiredElements = {
      home: [
        '#usage-count',
        '#page-switches',
        '#history-count',
        '#settings-count',
        '#test-action',
        '#quick-settings',
      ],
      settings: [
        '#dark-mode',
        '#auto-save',
        '#show-notifications',
        '#data-sync',
        '#font-size',
        '#language',
        '#save-settings',
        '#reset-settings',
      ],
      history: ['#history-list', '#clear-history', '#refresh-history'],
      about: ['#visit-website'],
    };

    const elements = requiredElements[pageName] || [];

    elements.forEach((selector) => {
      const element = document.querySelector(selector);
      console.log(`${selector}: ${element ? '✓ 存在' : '✗ 不存在'}`);
      if (element) {
        console.log(
            `  类型: ${element.tagName}, ID: ${element.id}, 类名: ${element.className}`);
      }
    });

    console.log('=== 页面检查结束 ===');
  }

  static waitForElement(selector, document, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkElement = () => {
        const element = document.querySelector(selector);

        if (element) {
          resolve(element);
          return;
        }

        if (Date.now() - startTime > timeout) {
          reject(new Error(`等待元素 ${selector} 超时`));
          return;
        }

        setTimeout(checkElement, 100);
      };

      checkElement();
    });
  }

  static validateDocument(document) {
    if (!document) {
      throw new Error('document 为 null 或 undefined');
    }

    if (!document.getElementById) {
      throw new Error('document 缺少 getElementById 方法');
    }

    return true;
  }
}

export default DebugHelper;
