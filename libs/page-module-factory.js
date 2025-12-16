/**
 * 页面模块工厂
 */
export function createPageModule(config) {
  const {
    pageName,
    onInit,
    onDestroy,
    onStateUpdate,
    onEvent
  } = config;

  return async function pageModule(context) {
    const {
      stateManager,
      showNotification,
      iframeWindow,
      iframeDocument,
      state,
      sharedModules
    } = context;

    // 等待DOM加载
    await waitForDOMReady(iframeDocument);

    // 创建页面控制器
    const controller = {
      pageName,
      stateManager,
      showNotification,
      document: iframeDocument,
      window: iframeWindow,
      sharedModules,

      // 工具方法
      query: (selector) => iframeDocument.querySelector(selector),
      queryAll: (selector) => iframeDocument.querySelectorAll(selector),
      getElement: (id) => iframeDocument.getElementById(id),
      updateText: (id, text) => {
        const element = iframeDocument.getElementById(id);
        if (element) element.textContent = text;
      },
      updateHTML: (id, html) => {
        const element = iframeDocument.getElementById(id);
        if (element) element.innerHTML = html;
      },
      setVisibility: (id, visible) => {
        const element = iframeDocument.getElementById(id);
        if (element) element.style.display = visible ? '' : 'none';
      },

      // 事件处理
      eventHandlers: new Map(),

      on: (event, handler) => {
        if (!controller.eventHandlers.has(event)) {
          controller.eventHandlers.set(event, []);
        }
        controller.eventHandlers.get(event).push(handler);
      },

      emit: (event, data) => {
        const handlers = controller.eventHandlers.get(event);
        if (handlers) {
          handlers.forEach(handler => handler(data));
        }
      },

      // 绑定事件
      bindEvent: (element, event, handler, options = {}) => {
        if (typeof element === 'string') {
          element = iframeDocument.querySelector(element);
        }

        if (element) {
          element.addEventListener(event, handler, options);

          // 保存引用以便清理
          if (!controller.eventHandlers.has('_dom_events')) {
            controller.eventHandlers.set('_dom_events', []);
          }
          controller.eventHandlers.get('_dom_events').push({
            element,
            event,
            handler
          });

          return () => element.removeEventListener(event, handler);
        }
      }
    };

    // 执行初始化
    if (onInit && typeof onInit === 'function') {
      await onInit(controller, state);
    }

    // 返回控制器
    return {
      pageName,
      controller,

      destroy: () => {
        // 清理DOM事件
        const domEvents = controller.eventHandlers.get('_dom_events');
        if (domEvents) {
          domEvents.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
          });
        }

        // 执行自定义清理
        if (onDestroy && typeof onDestroy === 'function') {
          onDestroy(controller);
        }

        console.log(`页面 ${pageName} 模块已销毁`);
      },

      updateState: (newState) => {
        if (onStateUpdate && typeof onStateUpdate === 'function') {
          onStateUpdate(controller, newState);
        }
      },

      handleEvent: (event, data) => {
        if (onEvent && typeof onEvent === 'function') {
          onEvent(controller, event, data);
        }
      }
    };
  };
}

/**
 * 等待DOM准备就绪
 */
function waitForDOMReady(document) {
  return new Promise((resolve) => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(resolve, 100);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(resolve, 100);
      });
    }
  });
}