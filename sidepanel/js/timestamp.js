import {
  handleClosePanel,
  handleConvertDateToTimestamp,
  handleConvertTimestamp,
  handleCopyTimestamp,
  handleStartTimer,
  handleStopTimer,
  handleTimezoneInput,
  handleTimezoneResult,
  handleToggleUnit,
} from '../modules/eventHandlers.js';
import {updateTimestamp} from './utils/timestampUtils.js';
import {timeZoneList} from './const/timezone.js';
import {BaseComponent} from './components/BaseComponet.js';

// 获取本地时区
const localTimeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone;

class Timestamp extends BaseComponent {
  constructor() {
    super();
    // 定义一个全局变量来保存是否显示毫秒
    this.showMilliseconds = true;
    // 定义一个全局变量来保存计时器
    this.timestampInterval = null;
  }

  async init() {
    const currentTimestampValue = document.getElementById('current-timestamp-value');

    // 初始化时更新一次时间戳
    updateTimestamp(currentTimestampValue, this.showMilliseconds);

    this.timestampInterval = this.setInterval(() =>
        updateTimestamp(currentTimestampValue, this.showMilliseconds),
      100);

    const timezoneResultSelect = document.getElementById('timezone-result');
    const timezoneInputSelect = document.getElementById('timezone-input');
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

    const timestampInput = document.getElementById('timestamp-input');
    const dateInput = document.getElementById('datetime-input');

    timestampInput.value = Date.now();
    dateInput.value = new Date().toLocaleString('sv-SE');

    this.bindBtnEvent();
  }

  bindBtnEvent() {
    // 绑定时间戳相关按钮事件
    this.bindEvent(
      'toggle-unit-btn',
      'click',
      () => (this.showMilliseconds = handleToggleUnit(this.showMilliseconds))
    );
    // 绑定计时器相关按钮事件
    this.bindEvent('stop-timer-btn', 'click', () => handleStopTimer(this.timestampInterval));
    // 绑定开始计时器事件
    this.bindEvent(
      'start-timer-btn',
      'click',
      () =>
        (this.timestampInterval = handleStartTimer(this.timestampInterval, this.showMilliseconds))
    );
    // 绑定时间戳转换按钮事件
    this.bindEvent('convert-timestamp-to-date-btn', 'click', handleConvertTimestamp);
    // 绑定日期转换按钮事件
    this.bindEvent('convert-date-to-timestamp-btn', 'click', handleConvertDateToTimestamp);
    // 绑定复制时间戳按钮事件
    this.bindEvent('copy-timestamp-btn', 'click', handleCopyTimestamp);
    // 绑定关闭面板按钮事件
    this.bindEvent('close-panel-btn', 'click', handleClosePanel);
    // 绑定切换时区事件
    this.bindEvent('timezone-result', 'change', handleTimezoneResult);
    // 绑定输入时区事件
    this.bindEvent('timezone-input', 'change', handleTimezoneInput);
  }
}

window.timestamp = Timestamp;
