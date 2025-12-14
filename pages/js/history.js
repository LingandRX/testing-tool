/**
 * 历史记录页面模块
 */
export default async function initHistoryPage({
  stateManager,
  showNotification,
  iframeWindow,
  iframeDocument,
  state,
}) {
  console.log('初始化历史记录页面模块');

  // 渲染历史记录
  renderHistory(state.history, iframeDocument);

  // 绑定事件
  const cleanupFunctions = bindEvents(stateManager, showNotification,
      iframeDocument);

  // 返回控制器对象
  return {
    destroy: () => {
      console.log('清理历史记录页面资源');
      cleanupFunctions.forEach((cleanup) => cleanup());
    },

    // 提供更新历史记录的方法
    updateHistory: (history) => {
      renderHistory(history, iframeDocument);
    },
  };
}

/**
 * 渲染历史记录
 */
function renderHistory(history, document) {
  const historyList = document.getElementById('history-list');

  if (!historyList) return;

  if (history.length === 0) {
    historyList.innerHTML = '<div class="history-item">暂无历史记录</div>';
    return;
  }

  const historyHTML = history.map((item) => {
    const time = new Date(item.timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
      <div class="history-item">
        <div class="history-time">${time}</div>
        <div class="history-action">${item.action}</div>
      </div>
    `;
  }).join('');

  historyList.innerHTML = historyHTML;
}

/**
 * 绑定事件
 */
function bindEvents(stateManager, showNotification, document) {
  const cleanupFunctions = [];

  // 清空历史按钮
  const clearButton = document.getElementById('clear-history');
  if (clearButton) {
    const clearHandler = () => {
      if (confirm('确定要清空所有历史记录吗？')) {
        stateManager.clearHistory();
        showNotification('历史记录已清空');
      }
    };

    clearButton.addEventListener('click', clearHandler);
    cleanupFunctions.push(
        () => clearButton.removeEventListener('click', clearHandler));
  }

  // 刷新记录按钮
  const refreshButton = document.getElementById('refresh-history');
  if (refreshButton) {
    const refreshHandler = () => {
      const currentState = stateManager.getState();
      renderHistory(currentState.history, document);
      showNotification('历史记录已刷新');
    };

    refreshButton.addEventListener('click', refreshHandler);
    cleanupFunctions.push(
        () => refreshButton.removeEventListener('click', refreshHandler));
  }

  return cleanupFunctions;
}
