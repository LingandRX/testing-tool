/**
 * 首页模块
 */
export default async function initHomePage({
  stateManager,
  showNotification,
  iframeWindow,
  iframeDocument,
  state,
}) {
  console.log('初始化首页模块');

  // 等待iframe DOM完全加载
  await waitForDOMReady(iframeDocument);

  // 安全地更新UI
  safeUpdateUI(() => {
    updateStats(state.stats, iframeDocument);
  });

  // 绑定事件
  const cleanupFunctions = bindEvents(stateManager, showNotification,
      iframeDocument);

  // 返回控制器对象
  return {
    destroy: () => {
      console.log('清理首页资源');
      cleanupFunctions.forEach((cleanup) => cleanup());
    },

    updateState: (newState) => {
      safeUpdateUI(() => {
        updateStats(newState.stats, iframeDocument);
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
      // 额外等待一下确保所有元素都已渲染
      setTimeout(resolve, 100);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(resolve, 100);
      });
    }
  });
}

/**
 * 安全更新UI（带错误处理）
 */
function safeUpdateUI(callback) {
  try {
    callback();
  } catch (error) {
    console.error('更新UI失败:', error);
  }
}

/**
 * 更新统计数据
 */
function updateStats(stats, document) {
  const elements = {
    'usage-count': stats.usageCount,
    'page-switches': stats.pageSwitches,
    'history-count': stats.historyCount,
    'settings-count': stats.settingsCount,
  };

  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    } else {
      console.warn(`元素 #${id} 未找到`);
    }
  });
}

/**
 * 绑定事件
 */
function bindEvents(stateManager, showNotification, document) {
  const cleanupFunctions = [];

  // 测试操作按钮
  const testButton = document.getElementById('test-action');
  if (testButton) {
    const testHandler = () => {
      stateManager.addHistory('执行了测试操作');
      showNotification('测试操作已执行');
      stateManager.incrementUsage();
    };

    testButton.addEventListener('click', testHandler);
    cleanupFunctions.push(() => {
      testButton.removeEventListener('click', testHandler);
    });
  } else {
    console.warn('未找到测试操作按钮');
  }

  // 快速设置按钮
  const quickSettingsButton = document.getElementById('quick-settings');
  if (quickSettingsButton) {
    const quickSettingsHandler = () => {
      stateManager.navigateTo('settings');
    };

    quickSettingsButton.addEventListener('click', quickSettingsHandler);
    cleanupFunctions.push(() => {
      quickSettingsButton.removeEventListener('click', quickSettingsHandler);
    });
  } else {
    console.warn('未找到快速设置按钮');
  }

  return cleanupFunctions;
}
