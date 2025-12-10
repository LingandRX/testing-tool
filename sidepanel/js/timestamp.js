import {
  handleToggleUnit,
  handleStopTimer,
  handleStartTimer,
  handleConvertTimestamp,
  handleConvertDateToTimestamp,
  handleCopyTimestamp,
  handleClosePanel,
  handleTimezoneResult,
  handleTimezoneInput,
} from '../modules/eventHandlers.js';
import { updateTimestamp } from '../utils/timestampUtils.js';
import { addEventListenerById } from '../utils/domUtils.js';
import { timeZoneList } from './const/timezone.js';

// 定义一个全局变量来保存是否显示毫秒
let showMilliseconds = true;
// 定义一个全局变量来保存计时器
let timestampInterval;
// 获取本地时区
const localTimeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * 初始化时间戳显示
 */
function initTimestampDisplay() {
  const currentTimestampValue = document.getElementById('current-timestamp-value');

  // 初始化时更新一次时间戳
  updateTimestamp(currentTimestampValue, showMilliseconds);

  // 添加时间戳定时器
  if (timestampInterval) {
    console.log('clearInterval');
    clearInterval(timestampInterval);
    window.timerManager.clearInterval(timestampInterval);
  }
  timestampInterval = setInterval(
    () => updateTimestamp(currentTimestampValue, showMilliseconds),
    100
  );
  window.timerManager.setInterval(timestampInterval);

  initTimeZoneList();
  initTimestampAndDate();
}

/**
 * 初始化时区列表
 */
function initTimeZoneList() {
  const timezoneResultSelect = document.getElementById('timezone-result');
  const timezoneInputSelect = document.getElementById('timezone-input');

  // 获取本地时区在列表中的索引
  const localTimeZoneIndex = timeZoneList.indexOf(localTimeZone);

  for (let i = 0; i < timeZoneList.length; i++) {
    if (i === localTimeZoneIndex) {
      // 默认选中本地时区
      timezoneResultSelect.add(new Option(timeZoneList[i], i, true, true));
      timezoneInputSelect.add(new Option(timeZoneList[i], i, true, true));
    } else {
      timezoneResultSelect.add(new Option(timeZoneList[i], i));
      timezoneInputSelect.add(new Option(timeZoneList[i], i));
    }
  }
}

/**
 * 初始化时间戳和日期输入框
 */
function initTimestampAndDate() {
  const timestampInput = document.getElementById('timestamp-input');
  const dateInput = document.getElementById('datetime-input');

  timestampInput.value = Date.now();
  dateInput.value = new Date().toLocaleString('sv-SE');
}

// 初始化时间戳显示
initTimestampDisplay();

// 绑定时间戳相关按钮事件
addEventListenerById(
  'toggle-unit-btn',
  'click',
  () => (showMilliseconds = handleToggleUnit(showMilliseconds))
);
// 绑定计时器相关按钮事件
addEventListenerById('stop-timer-btn', 'click', () => handleStopTimer(timestampInterval));
addEventListenerById(
  'start-timer-btn',
  'click',
  () => (timestampInterval = handleStartTimer(timestampInterval, showMilliseconds))
);
// 绑定时间戳转换按钮事件
addEventListenerById('convert-timestamp-to-date-btn', 'click', handleConvertTimestamp);
// 绑定日期转换按钮事件
addEventListenerById('convert-date-to-timestamp-btn', 'click', handleConvertDateToTimestamp);
// 绑定复制时间戳按钮事件
addEventListenerById('copy-timestamp-btn', 'click', handleCopyTimestamp);
// 绑定关闭面板按钮事件
addEventListenerById('close-panel-btn', 'click', handleClosePanel);
// 绑定切换时区事件
addEventListenerById('timezone-result', 'change', handleTimezoneResult);
// 绑定输入时区事件
addEventListenerById('timezone-input', 'change', handleTimezoneInput);
