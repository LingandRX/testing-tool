import {
  updateTimestamp,
  convertTimestampToDate,
  convertDateToTimestamp,
} from '../utils/timestampUtils.js';
import { getElementById } from '../utils/domUtils.js';

// 定义一个全局变量来保存是否显示毫秒
let showMilliseconds = true;
// 定义一个全局变量来保存计时器
let timestampInterval;
// 定义时区列表
const timeZoneList = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'America/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Pacific/Auckland',
];
// 获取本地时区
const localTimeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * 初始化时间戳显示
 */
export function initTimestampDisplay() {
  updateTimestamp(showMilliseconds); // 初始化时更新一次时间戳
  timestampInterval = setInterval(() => updateTimestamp(showMilliseconds), 100);
  initTimeZoneList();
  initTimestampAndDate();
}

/**
 * 初始化时区列表
 */
export function initTimeZoneList() {
  const timezoneResultSelect = getElementById('timezone-result');
  const timezoneInputSelect = getElementById('timezone-input');

  // 获取本地时区在列表中的索引
  const localTimeZoneIndex = timeZoneList.indexOf(localTimeZone);

  for (let i = 0; i < timeZoneList.length; i++) {
    if (i === localTimeZoneIndex) {
      timezoneResultSelect.add(new Option(timeZoneList[i], i, true, true));
      timezoneInputSelect.add(new Option(timeZoneList[i], i, true, true));
    } else {
      timezoneResultSelect.add(new Option(timeZoneList[i], i));
      timezoneInputSelect.add(new Option(timeZoneList[i], i));
    }
  }
}

export function initTimestampAndDate() {
  const timestampInput = getElementById('timestamp-input');
  const dateInput = getElementById('datetime-input');

  timestampInput.value = Date.now();
  dateInput.value = new Date().toLocaleString('sv-SE'); // 使用适合<input type="datetime-local">的格式
}

/**
 * 切换单位按钮事件处理器
 */
export function handleToggleUnit() {
  const currentTimestampUnit = getElementById('current-timestamp-unit');
  const toggleUnitBtn = getElementById('toggle-unit-btn');

  showMilliseconds = !showMilliseconds;
  currentTimestampUnit.textContent = showMilliseconds ? '毫秒' : '秒';
  updateTimestamp(showMilliseconds);

  // 添加闪烁动画效果
  toggleUnitBtn.style.transition = 'all 0.3s';
  toggleUnitBtn.style.transform = 'scale(1.02)';
  setTimeout(() => {
    toggleUnitBtn.style.transform = 'scale(1)';
  }, 300);
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
  const timezoneResultSelect = getElementById('timezone-result'); // 获取时区选择器

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
  const inputDate = getElementById('datetime-input');
  const dateInputResult = getElementById('date-conversion-result');
  const timestampUnitSelect = document.querySelector('#page-timestamp #date-result-unit-select');
  const timezoneInputSelect = getElementById('timezone-input'); // 获取时区选择器

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
  const currentTimestamp = getElementById('current-timestamp-value');
  const copyTimestampBtn = getElementById('copy-timestamp-btn');
  const timestampText = currentTimestamp.textContent;

  copyTimestampBtn.textContent = '已复制';
  copyTimestampBtn.style.fontWeight = 'bold';

  // 添加闪烁动画效果
  copyTimestampBtn.style.transition = 'all 0.3s';
  copyTimestampBtn.style.transform = 'scale(1.02)';
  setTimeout(() => {
    copyTimestampBtn.style.transform = 'scale(1)';
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
  const timezoneResult = getElementById('timezone-result');
  console.log(timeZoneList[timezoneResult.value]);

  // 获取当前时间戳输入框的值
  const inputTimestamp = getElementById('timestamp-input').value.trim();
  const timestampInputResult = getElementById('timestamp-conversion-result');
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
  const timezoneInput = getElementById('timezone-input');
  const selectedTimezone = timeZoneList[timezoneInput.value];
  console.log('选择的时区：', selectedTimezone);

  // 获取当前日期输入框的值
  const inputDate = getElementById('datetime-input').value.trim();
  const dateInputResult = getElementById('date-conversion-result');
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
