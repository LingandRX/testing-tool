import {
  initTimestampDisplay,
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
import { addEventListenerById } from '../utils/domUtils.js';

(function (global) {
  global.timestampInit = async function () {
    // 初始化时间戳显示
    initTimestampDisplay();

    // 绑定事件处理器
    // 绑定时间戳相关按钮事件
    addEventListenerById('toggle-unit-btn', 'click', handleToggleUnit);
    // 绑定计时器相关按钮事件
    addEventListenerById('stop-timer-btn', 'click', handleStopTimer);
    addEventListenerById('start-timer-btn', 'click', handleStartTimer);
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
  };
})(window);
