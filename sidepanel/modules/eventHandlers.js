import {convertDateToTimestamp, convertTimestampToDate, updateTimestamp,} from '../js/utils/timestampUtils.js';

import {timeZoneList} from '../js/const/timezone.js';

/**
 * 切换单位按钮事件处理器
 */
export function handleToggleUnit(showMilliseconds) {
  const currentTimestampUnit = document.getElementById('current-timestamp-unit');
  const toggleUnitBtn = document.getElementById('toggle-unit-btn');

  // 更新showMilliseconds
  showMilliseconds = !showMilliseconds;

  // 更新时间戳显示
  currentTimestampUnit.textContent = showMilliseconds ? '毫秒' : '秒';
  const currentTimestamp = document.getElementById('current-timestamp-value');
  const timestamp = Date.now();
  currentTimestamp.textContent = showMilliseconds ? timestamp : Math.floor(timestamp / 1000);

  // 添加闪烁动画效果
  toggleUnitBtn.style.transition = 'all 0.3s';
  toggleUnitBtn.style.transform = 'scale(1.02)';
  setTimeout(() => {
    toggleUnitBtn.style.transform = 'scale(1)';
  }, 300);

  // 返回更新的showMilliseconds
  return showMilliseconds;
}

/**
 * 停止计时器事件处理器
 */
export function handleStopTimer(timestampInterval) {
  console.log('停止计时器');
  if (timestampInterval) {
    clearInterval(timestampInterval);
    window.timerManager.clearInterval(timestampInterval);
  }

  const stopTimestampBtn = document.getElementById('stop-timer-btn');
  const startTimestampBtn = document.getElementById('start-timer-btn');
  stopTimestampBtn.style.display = 'none';
  startTimestampBtn.style.display = 'inline-block';
}

/**
 * 开始计时器事件处理器
 */
export function handleStartTimer(timestampInterval, showMilliseconds) {
  const startTimestampBtn = document.getElementById('start-timer-btn');
  const stopTimestampBtn = document.getElementById('stop-timer-btn');
  const currentTimestampValue = document.getElementById('current-timestamp-value');

  // 添加计时器
  if (timestampInterval) {
    window.timerManager.clearInterval(timestampInterval);
  }
  timestampInterval = setInterval(
    () => updateTimestamp(currentTimestampValue, showMilliseconds),
    100
  );
  window.timerManager.setInterval(timestampInterval);

  // 切换按钮样式
  startTimestampBtn.style.display = 'none';
  stopTimestampBtn.style.display = 'inline-block';

  return timestampInterval;
}

/**
 * 时间戳转换事件处理器
 */
export function handleConvertTimestamp() {
  const inputTimestamp = document.getElementById('timestamp-input');
  const timestampInputResult = document.getElementById('timestamp-conversion-result');
  const timestampUnitSelect = document.querySelector(
    '#page-timestamp #timestamp-input-unit-select'
  );
  const timezoneResultSelect = document.getElementById('timezone-result'); // 获取时区选择器

  const timestamp = inputTimestamp.value.trim();

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

  // 获取选择的时区
  const selectedTimezone = timeZoneList[timezoneResultSelect.value];

  console.log('选择的时区：', selectedTimezone);

  const result = convertTimestampToDate(timestamp, isSeconds, selectedTimezone);
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
  const inputDate = document.getElementById('datetime-input');
  const dateInputResult = document.getElementById('date-conversion-result');
  const timestampUnitSelect = document.querySelector('#page-timestamp #date-result-unit-select');
  const timezoneInputSelect = document.getElementById('timezone-input'); // 获取时区选择器

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

  // 获取选择的时区
  const selectedTimezone = timeZoneList[timezoneInputSelect.value];

  console.log('选择的时区：', selectedTimezone);
  const date = new Date(dateStr);

  // 转换为时间戳
  const timestamp = convertDateToTimestamp(date, selectedTimezone);

  if (isNaN(timestamp)) {
    dateInputResult.value = '无效的日期字符串';
    dateInputResult.style.borderColor = '#dc3545';
    return;
  }

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
  const currentTimestamp = document.getElementById('current-timestamp-value');
  const copyTimestampBtn = document.getElementById('copy-timestamp-btn');
  const timestampText = currentTimestamp.textContent;

  copyTimestampBtn.textContent = '已复制';
  copyTimestampBtn.style.fontWeight = 'bold';
  setTimeout(() => {
    copyTimestampBtn.textContent = '复制';
    copyTimestampBtn.style.color = '';
    copyTimestampBtn.style.fontWeight = '';
  }, 300);

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

/**
 * 时间区域选择事件处理器
 */
export function handleTimezoneResult() {
  const timezoneResult = document.getElementById('timezone-result');
  console.log(timeZoneList[timezoneResult.value]);

  // 获取当前时间戳输入框的值
  const inputTimestamp = document.getElementById('timestamp-input').value.trim();
  const timestampInputResult = document.getElementById('timestamp-conversion-result');
  const timestampUnitSelect = document.querySelector(
    '#page-timestamp #timestamp-input-unit-select'
  );

  // 如果有输入时间戳，则重新计算结果
  if (inputTimestamp) {
    const isSeconds = timestampUnitSelect.value === 'seconds';
    const selectedTimezone = timeZoneList[timezoneResult.value];
    const result = convertTimestampToDate(inputTimestamp, isSeconds, selectedTimezone);
    timestampInputResult.value = result;
  }
}

/**
 * 处理时区输入事件
 * 该函数获取时区输入元素的值，并在控制台输出对应的时区信息
 */
export function handleTimezoneInput() {
  const timezoneInput = document.getElementById('timezone-input');
  const selectedTimezone = timeZoneList[timezoneInput.value];
  console.log('选择的时区：', selectedTimezone);

  // 获取当前日期输入框的值
  const inputDate = document.getElementById('datetime-input').value.trim();
  const dateInputResult = document.getElementById('date-conversion-result');
  const timestampUnitSelect = document.querySelector('#page-timestamp #date-result-unit-select');

  // 如果有输入日期，则重新计算结果
  if (inputDate) {
    console.log('输入的日期：', inputDate);
    const date = new Date(inputDate);
    // 转换为时间戳
    const timestamp = convertDateToTimestamp(date, selectedTimezone);
    if (!isNaN(timestamp)) {
      const timestamp = date.getTime();
      const isSeconds = timestampUnitSelect.value === 'seconds';
      const finalTimestamp = isSeconds ? Math.floor(timestamp / 1000) : timestamp;
      dateInputResult.value = finalTimestamp;
    }
  }
}
