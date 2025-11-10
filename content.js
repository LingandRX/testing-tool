(() => {
  const SIDEBAR_ID = 'floating-sidebar';
  const TOGGLE_ID = 'floating-toggle-btn';

  // 若侧边栏已存在则移除
  const existing = document.getElementById(SIDEBAR_ID);
  const existingBtn = document.getElementById(TOGGLE_ID);
  if (existing && existingBtn) {
    existing.remove();
    existingBtn.remove();
    return;
  }

  // 创建 iframe
  const iframe = document.createElement('iframe');
  iframe.id = SIDEBAR_ID;
  iframe.src = chrome.runtime.getURL('sidepanel/index.html');

  Object.assign(iframe.style, {
    position: 'fixed',
    top: '0',
    right: '0',
    width: '360px',
    height: '100%',
    border: 'none',
    zIndex: '2147483647',
    boxShadow: '-4px 0 8px rgba(0,0,0,0.15)',
    backgroundColor: 'white',
    transform: 'translateX(0)',
    transition: 'transform 0.3s ease',
  });

  document.body.appendChild(iframe);

  // 创建控制按钮
  const toggleBtn = document.createElement('div');
  toggleBtn.id = TOGGLE_ID;
  toggleBtn.textContent = '≡';
  Object.assign(toggleBtn.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '48px',
    height: '48px',
    backgroundColor: '#0078d7',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    zIndex: '2147483648',
    transition: 'background-color 0.2s ease',
  });

  toggleBtn.addEventListener('mouseenter', () => {
    toggleBtn.style.backgroundColor = '#005fa3';
  });
  toggleBtn.addEventListener('mouseleave', () => {
    toggleBtn.style.backgroundColor = '#0078d7';
  });

  document.body.appendChild(toggleBtn);

  // 折叠 / 展开逻辑
  let visible = true;
  toggleBtn.addEventListener('click', () => {
    visible = !visible;
    iframe.style.transform = visible ? 'translateX(0)' : 'translateX(100%)';
  });
  // 如果使用 window.postMessage
  window.addEventListener('message', function (event) {
    // 检查消息来源是否可信 (非常重要!)
    if (event.origin !== 'chrome-extension://njacfkelcmfnpdbnbkpenogmokmglkcn') {
      return;
    }
    if (event.data.action === 'closeSidebar') {
      console.log('Received closeSidebar message');
      visible = !visible;
      iframe.style.transform = visible ? 'translateX(0)' : 'translateX(100%)';
    }
  });
})();
