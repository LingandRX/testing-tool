/**
 * 关于页面模块
 */
export default async function initAboutPage({
  stateManager,
  showNotification,
  iframeWindow,
  iframeDocument,
  state,
}) {
  console.log('初始化关于页面模块');

  // 绑定事件
  const cleanupFunctions = bindEvents(stateManager, showNotification,
      iframeDocument);

  // 返回控制器对象
  return {
    destroy: () => {
      console.log('清理关于页面资源');
      cleanupFunctions.forEach((cleanup) => cleanup());
    },
  };
}

/**
 * 绑定事件
 */
function bindEvents(stateManager, showNotification, document) {
  const cleanupFunctions = [];

  // 访问网站按钮
  const visitButton = document.getElementById('visit-website');
  if (visitButton) {
    const visitHandler = () => {
      stateManager.addHistory('点击了访问网站按钮');
      showNotification('这是一个示例，实际应用中会打开网站');
    };

    visitButton.addEventListener('click', visitHandler);
    cleanupFunctions.push(
        () => visitButton.removeEventListener('click', visitHandler));
  }

  return cleanupFunctions;
}
