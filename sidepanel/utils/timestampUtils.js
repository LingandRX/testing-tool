/**
 * 时间戳工具类函数
 */

/**
 * 更新时间戳
 * @param {boolean} showMilliseconds - 是否显示毫秒
 */
export function updateTimestamp(showMilliseconds = true) {
  const currentTimestamp = document.getElementById('current-timestamp-value');
  const timestamp = Date.now();
  currentTimestamp.textContent = showMilliseconds ? timestamp : Math.floor(timestamp / 1000);
}

/**
 * 转换时间戳为日期格式
 * @param {string} timestamp - 输入的时间戳
 * @param {boolean} isSeconds - 是否为秒格式
 * @param {string} timeZone - 时区，默认为本地时区
 * @returns {string} 格式化后的日期字符串
 */
export function convertTimestampToDate(
  timestamp,
  isSeconds,
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
) {
  // 转换为数字
  let timestampNum = Number(timestamp);

  // 如果是秒，转换为毫秒
  if (isSeconds) {
    timestampNum = timestampNum * 1000;
  }

  // 检查是否为有效数字
  if (isNaN(timestampNum)) {
    return '请输入有效的时间戳';
  }

  // 创建日期对象
  const date = new Date(timestampNum);

  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return '无效的日期';
  }

  // 使用Intl.DateTimeFormat来根据时区格式化日期
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZone: timeZone,
  });

  return formatter.format(date);
}

/**
 * 转换日期格式为时间戳
 * @param {string|Date} date - 输入的日期字符串或Date对象
 * @param {string} timeZone - 时区，默认为本地时区
 * @returns {number|string} 时间戳或错误信息
 */
export function convertDateToTimestamp(
  date,
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
) {
  try {
    // 创建日期对象
    const dateObj = new Date(date);

    // 检查日期是否有效
    if (isNaN(dateObj.getTime())) {
      return '无效的日期';
    }

    // 如果提供了时区，则需要特殊处理
    if (timeZone) {
      // 获取给定时区相对于UTC的时间差（毫秒）
      const utc = dateObj.getTime() + dateObj.getTimezoneOffset() * 60000;

      // 计算目标时区相对于UTC的偏移量
      const targetOffset = getTimeZoneOffset(timeZone);

      // 返回目标时区对应的时间戳
      const targetTimestamp = utc + targetOffset;
      return targetTimestamp;
    } else {
      // 没有时区参数，直接返回时间戳
      const timestamp = dateObj.getTime();
      console.log('timestamp: ', timestamp);
      return timestamp;
    }
  } catch (error) {
    return '日期转换错误: ' + error.message;
  }
}

/**
 * 获取指定时区相对于UTC的偏移量（毫秒）
 * @param {string} timeZone - 时区名称
 * @returns {number} 偏移量（毫秒）
 */
function getTimeZoneOffset(timeZone) {
  const now = new Date();
  const utc = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
  const target = new Date(now.toLocaleString('en-US', { timeZone: timeZone }));
  return target.getTime() - utc.getTime();
}
