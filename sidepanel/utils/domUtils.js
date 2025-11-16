/**
 * DOM工具类函数
 */

/**
 * 切换页面显示（带动画效果）
 * @param {string} pageName - 页面名称
 */
export function switchPage(pageName) {
  // 先隐藏当前活跃页面（如果有）
  const currentPage = document.querySelector('.page.active');
  if (currentPage) {
    currentPage.classList.remove('active');
    
    // 添加离开动画
    currentPage.style.opacity = '0';
    currentPage.style.transform = 'translateX(20px)';
    
    // 等待动画完成后真正隐藏
    setTimeout(() => {
      if (!currentPage.classList.contains('active')) {
        currentPage.style.display = 'none';
      }
    }, 300);
  }

  // 移除所有导航按钮的 active 状态
  document.querySelectorAll('.nav-button').forEach((button) => {
    button.classList.remove('active');
  });

  // 显示目标页面
  const targetPage = document.getElementById(`page-${pageName}`);
  if (targetPage) {
    targetPage.style.display = 'block';
    
    // 触发重排以确保display变化生效
    targetPage.offsetHeight;
    
    // 添加进入动画
    targetPage.style.opacity = '0';
    targetPage.style.transform = 'translateX(-20px)';
    
    setTimeout(() => {
      targetPage.classList.add('active');
      targetPage.style.opacity = '1';
      targetPage.style.transform = 'translateX(0)';
    }, 10);
  }

  // 激活对应的导航按钮
  const navButton = document.getElementById(`nav-${pageName}-btn`) || document.getElementById(`nav-${pageName}`);
  if (navButton) {
    navButton.classList.add('active');
  }
}

/**
 * 根据ID获取元素的便捷方法
 * @param {string} id - 元素ID
 * @returns {HTMLElement} - DOM元素
 */
export function getElementById(id) {
  return document.getElementById(id);
}

/**
 * 为元素添加事件监听器
 * @param {string} id - 元素ID
 * @param {string} event - 事件类型
 * @param {Function} handler - 事件处理函数
 */
export function addEventListenerById(id, event, handler) {
  const element = getElementById(id);
  if (element) {
    element.addEventListener(event, handler);
  }
}