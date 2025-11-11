document.getElementById('close').addEventListener('click', () => {
  window.parent.postMessage({ action: 'indexind' }, '*');
});

// sidepanel/index.js
// 页面切换逻辑
document.getElementById('nav-timestamp').addEventListener('click', () => {
  switchPage('timestamp');
});

document.getElementById('nav-other').addEventListener('click', () => {
  switchPage('other');
});

/**
 * 更新时间戳显示
 */
function updateTimestamp(showMilliseconds = true) {
  const currentTimestamp = document.getElementById('current-timestamp');
  const currentTimestampUnit = document.getElementById('timestamp-unit');
  const timestamp = Date.now();
  const unit = showMilliseconds ? '毫秒' : '秒';
  currentTimestamp.textContent = showMilliseconds ? timestamp : Math.floor(timestamp / 1000);
  currentTimestampUnit.textContent = unit;
}

const toggleTimestampBtn = document.getElementById('toggle-timestamp-btn');
const stopTimestampBtn = document.getElementById('stop-timestamp-btn');
const startTimestampBtn = document.getElementById('start-timestamp-btn');

stopTimestampBtn.addEventListener('click', () => {
  clearInterval(timestampInterval);
  stopTimestampBtn.style.display = 'none';
  startTimestampBtn.style.display = 'inline-block';
});

startTimestampBtn.addEventListener('click', () => {
  timestampInterval = setInterval(() => updateTimestamp(showMilliseconds), 100);
  startTimestampBtn.style.display = 'none';
  stopTimestampBtn.style.display = 'inline-block';
});

let showMilliseconds = true;
updateTimestamp(showMilliseconds); // 初始化时更新一次时间戳
let timestampInterval = setInterval(() => updateTimestamp(showMilliseconds), 100);
toggleTimestampBtn.addEventListener('click', () => {
  showMilliseconds = !showMilliseconds;
  updateTimestamp(showMilliseconds);
});

// 复制时间戳到剪贴板
const copyTimestampBtn = document.getElementById('copy-timestamp-btn');
const currentTimestamp = document.getElementById('current-timestamp');
copyTimestampBtn.addEventListener('click', () => {
  // 获取时间戳文本
  const timestampText = currentTimestamp.textContent;

  chrome.runtime.sendMessage({ action: 'copyText', data: timestampText }, (res) => {
    if (chrome.runtime.lastError) {
      console.error('❌ 传送时间戳文本失败：', chrome.runtime.lastError);
    } else if (res?.success) {
      console.log('✅ 已复制：', timestampText);
    } else {
      console.error('❌ 复制失败：', res);
    }
  });
});

function switchPage(pageName) {
  // 隐藏所有页面
  document.querySelectorAll('.page').forEach((page) => {
    page.classList.remove('active');
  });

  // 移除所有导航按钮的 active 状态
  document.querySelectorAll('.nav-button').forEach((button) => {
    button.classList.remove('active');
  });

  // 显示目标页面
  document.getElementById(`page-${pageName}`).classList.add('active');

  // 激活对应的导航按钮
  document.getElementById(`nav-${pageName}`).classList.add('active');
}

// 关闭按钮逻辑 (使用消息传递)
document.getElementById('close').addEventListener('click', () => {
  // 向父页面发送消息请求关闭
  window.parent.postMessage({ action: 'closeSidebar' }, '*');
});
