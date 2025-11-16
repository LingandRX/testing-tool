import { updateTimestamp, convertTimestampToDate } from '../utils/timestampUtils.js';
import { getElementById } from '../utils/domUtils.js';

// 定义一个全局变量来保存是否显示毫秒
let showMilliseconds = true;
// 定义一个全局变量来保存计时器
let timestampInterval;

/**
 * 初始化时间戳显示
 */
export function initTimestampDisplay() {
  updateTimestamp(showMilliseconds); // 初始化时更新一次时间戳
  timestampInterval = setInterval(() => updateTimestamp(showMilliseconds), 100);
}

/**
 * 切换单位按钮事件处理器
 */
export function handleToggleUnit() {
  showMilliseconds = !showMilliseconds;
  updateTimestamp(showMilliseconds);
}

/**
 * 停止计时器事件处理器
 */
export function handleStopTimer() {
  clearInterval(timestampInterval);
  const stopTimestampBtn = getElementById('stop-timer-btn');
  const startTimestampBtn = getElementById('start-timer-btn');
  stopTimestampBtn.style.display = 'none';
  startTimestampBtn.style.display = 'inline-block';
}

/**
 * 开始计时器事件处理器
 */
export function handleStartTimer() {
  const startTimestampBtn = getElementById('start-timer-btn');
  const stopTimestampBtn = getElementById('stop-timer-btn');
  timestampInterval = setInterval(() => updateTimestamp(showMilliseconds), 100);
  startTimestampBtn.style.display = 'none';
  stopTimestampBtn.style.display = 'inline-block';
}

/**
 * 时间戳转换事件处理器
 */
export function handleConvertTimestamp() {
  const inputTimestamp = getElementById('timestamp-input');
  const timestampInputResult = getElementById('timestamp-conversion-result');
  const timestampUnitSelect = document.querySelector(
    '#page-timestamp #timestamp-input-unit-select'
  );

  const timestamp = inputTimestamp.value.trim();
  console.log('输入时间戳：', timestamp);

  if (!timestamp) {
    timestampInputResult.value = '请输入时间戳';
    // 添加动画效果
    timestampInputResult.style.borderColor = '#dc3545';
    setTimeout(() => {
      timestampInputResult.style.borderColor = '';
    }, 1000);
    return;
  }

  // 获取选择的时间戳单位（秒或毫秒）
  const isSeconds = timestampUnitSelect.value === 'seconds';

  const result = convertTimestampToDate(timestamp, isSeconds);
  timestampInputResult.value = result;

  // 添加成功反馈动画
  if (result.includes('无效') || result.includes('请输入')) {
    timestampInputResult.style.borderColor = '#dc3545';
  } else {
    timestampInputResult.style.borderColor = '#28a745';
  }

  // 添加闪烁动画效果
  timestampInputResult.style.transition = 'all 0.3s';
  timestampInputResult.style.transform = 'scale(1.02)';
  setTimeout(() => {
    timestampInputResult.style.transform = 'scale(1)';
  }, 300);
}

/**
 * 日期转换事件处理器
 */
export function handleConvertDateToTimestamp() {
  const inputDate = getElementById('datetime-input');
  const dateInputResult = getElementById('date-conversion-result');
  const timestampUnitSelect = document.querySelector('#page-timestamp #date-result-unit-select');

  const dateStr = inputDate.value.trim();
  console.log('输入日期字符串：', dateStr);

  if (!dateStr) {
    dateInputResult.value = '请输入日期字符串';
    // 添加动画效果
    dateInputResult.style.borderColor = '#dc3545';
    setTimeout(() => {
      dateInputResult.style.borderColor = '';
    }, 1000);
    return;
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    dateInputResult.value = '无效的日期字符串';
    dateInputResult.style.borderColor = '#dc3545';
    return;
  }

  const timestamp = date.getTime();
  // 根据选择的单位决定显示秒还是毫秒
  const isSeconds = timestampUnitSelect.value === 'seconds';
  const finalTimestamp = isSeconds ? Math.floor(timestamp / 1000) : timestamp;
  dateInputResult.value = finalTimestamp;

  // 添加成功反馈动画
  dateInputResult.style.borderColor = '#28a745';

  // 添加闪烁动画效果
  dateInputResult.style.transition = 'all 0.3s';
  dateInputResult.style.transform = 'scale(1.02)';
  setTimeout(() => {
    dateInputResult.style.transform = 'scale(1)';
  }, 300);
}

/**
 * 复制时间戳事件处理器
 */
export function handleCopyTimestamp() {
  // 获取时间戳文本
  const currentTimestamp = getElementById('current-timestamp-value');
  const timestampText = currentTimestamp.textContent;

  // 添加复制反馈动画
  const originalText = currentTimestamp.textContent;
  currentTimestamp.textContent = '已复制!';
  currentTimestamp.style.color = '#28a745';
  currentTimestamp.style.fontWeight = 'bold';

  setTimeout(() => {
    currentTimestamp.textContent = originalText;
    currentTimestamp.style.color = '';
    currentTimestamp.style.fontWeight = '';
  }, 1000);

  // 检查扩展上下文是否仍然有效
  if (chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ action: 'copyText', data: timestampText }, (res) => {
      if (chrome.runtime.lastError) {
        console.error('❌ 传送时间戳文本失败：', chrome.runtime.lastError);
      } else if (res?.success) {
        console.log('✅ 已复制：', timestampText);
      } else {
        console.error('❌ 复制失败：', res);
      }
    });
  }
}

/**
 * 关闭面板事件处理器
 */
export function handleClosePanel() {
  // 向父页面发送消息请求关闭
  window.parent.postMessage({ action: 'closeSidebar' }, '*');
}
