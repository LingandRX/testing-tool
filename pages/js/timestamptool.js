export default async function initTimestamptoolPage({
  stateManager,
  showNotification,
  iframeWindow,
  iframeDocument,
  state,
}) {
  console.log('初始化时间戳模块');

  let showMilliseconds = true;

  // 等待iframe DOM完全加载
  await waitForDOMReady(iframeDocument);

  console.log(iframeDocument);
  console.log(iframeDocument.getElementById('current-timestamp-value'));

  updateCurrentTimestampValue(showMilliseconds, iframeDocument);

  // 安全地更新UI
  safeUpdateUI(() => {

  });

  // 返回控制器对象
  return {};
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
 * 更新当前时间戳值
 * @param showMilliseconds 是否显示毫秒
 */
function updateCurrentTimestampValue(showMilliseconds = true, iframeDocument) {
  const doc = iframeDocument ? iframeDocument : document;
  const currentTimestampValue = doc.getElementById(
      'current-timestamp-value');
  if (!currentTimestampValue) {
    console.error('未找到当前时间戳值元素');
    return;
  }
  currentTimestampValue.textContent = getCurrentTimestamp(showMilliseconds);
}

/**
 * 获取当前时间戳
 */
function getCurrentTimestamp(showMilliseconds = true) {
  const currentTimestamp = Date.now();
  return (showMilliseconds ? currentTimestamp : Math.floor(
      currentTimestamp / 1000)).toString();
}
