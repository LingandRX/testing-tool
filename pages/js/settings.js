/**
 * 设置页面模块
 */
export default async function initSettingsPage({
  stateManager,
  showNotification,
  iframeWindow,
  iframeDocument,
  state,
}) {
  console.log('初始化设置页面模块');

  // 等待iframe DOM完全加载
  await waitForDOMReady(iframeDocument);

  // 安全地初始化UI
  safeUpdateUI(() => {
    initializeUI(state.settings, iframeDocument);
  });

  // 绑定事件
  const cleanupFunctions = bindEvents(stateManager, showNotification,
      iframeDocument);

  // 返回控制器对象
  return {
    destroy: () => {
      console.log('清理设置页面资源');
      cleanupFunctions.forEach((cleanup) => cleanup());
    },

    updateSettings: (newSettings) => {
      safeUpdateUI(() => {
        updateUI(newSettings, iframeDocument);
      });
    },
  };
}

/**
 * 等待DOM准备就绪
 */
function waitForDOMReady(document) {
  return new Promise((resolve) => {
    if (document.readyState === 'complete' || document.readyState ===
        'interactive') {
      setTimeout(resolve, 100);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(resolve, 100);
      });
    }
  });
}

/**
 * 安全更新UI
 */
function safeUpdateUI(callback) {
  try {
    callback();
  } catch (error) {
    console.error('更新UI失败:', error);
  }
}

/**
 * 初始化UI
 */
function initializeUI(settings, document) {
  const elements = [
    {id: 'dark-mode', type: 'checkbox', value: settings.darkMode},
    {id: 'auto-save', type: 'checkbox', value: settings.autoSave},
    {
      id: 'show-notifications',
      type: 'checkbox',
      value: settings.showNotifications,
    },
    {id: 'data-sync', type: 'checkbox', value: settings.dataSync},
    {id: 'font-size', type: 'select', value: settings.fontSize},
    {id: 'language', type: 'select', value: settings.language},
  ];

  elements.forEach(({id, type, value}) => {
    const element = document.getElementById(id);
    if (element) {
      if (type === 'checkbox') {
        element.checked = Boolean(value);
      } else if (type === 'select') {
        element.value = value || '';
      }
    } else {
      console.warn(`设置元素 #${id} 未找到`);
    }
  });
}

/**
 * 更新UI
 */
function updateUI(settings, document) {
  initializeUI(settings, document);
}

/**
 * 绑定事件
 */
function bindEvents(stateManager, showNotification, document) {
  const cleanupFunctions = [];

  // 保存设置按钮
  const saveButton = document.getElementById('save-settings');
  if (saveButton) {
    const saveHandler = () => {
      const settings = getCurrentSettings(document);
      stateManager.updateSettings(settings);
      showNotification('设置已保存');
    };

    saveButton.addEventListener('click', saveHandler);
    cleanupFunctions.push(() => {
      saveButton.removeEventListener('click', saveHandler);
    });
  } else {
    console.warn('未找到保存设置按钮');
  }

  // 重置设置按钮
  const resetButton = document.getElementById('reset-settings');
  if (resetButton) {
    const resetHandler = () => {
      if (confirm('确定要重置所有设置为默认值吗？')) {
        const defaultSettings = {
          darkMode: false,
          autoSave: true,
          showNotifications: true,
          dataSync: false,
          fontSize: 'medium',
          language: 'zh-CN',
        };

        stateManager.updateSettings(defaultSettings);
        showNotification('设置已重置为默认值');
        updateUI(defaultSettings, document);
      }
    };

    resetButton.addEventListener('click', resetHandler);
    cleanupFunctions.push(() => {
      resetButton.removeEventListener('click', resetHandler);
    });
  } else {
    console.warn('未找到重置设置按钮');
  }

  // 实时监听设置变化
  const inputs = document.querySelectorAll('input, select');
  inputs.forEach((input) => {
    const changeHandler = () => {
      const settings = getCurrentSettings(document);
      stateManager.updateSettings(settings);
    };

    input.addEventListener('change', changeHandler);
    cleanupFunctions.push(() => {
      input.removeEventListener('change', changeHandler);
    });
  });

  return cleanupFunctions;
}

/**
 * 获取当前设置值
 */
function getCurrentSettings(document) {
  const elements = [
    {id: 'dark-mode', key: 'darkMode'},
    {id: 'auto-save', key: 'autoSave'},
    {id: 'show-notifications', key: 'showNotifications'},
    {id: 'data-sync', key: 'dataSync'},
    {id: 'font-size', key: 'fontSize'},
    {id: 'language', key: 'language'},
  ];

  const settings = {};

  elements.forEach(({id, key}) => {
    const element = document.getElementById(id);
    if (element) {
      if (element.type === 'checkbox') {
        settings[key] = element.checked;
      } else {
        settings[key] = element.value;
      }
    }
  });

  return settings;
}
