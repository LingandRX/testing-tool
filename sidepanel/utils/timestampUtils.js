/**
 * 时间戳工具类函数
 */

/**
 * 更新时间戳显示
 * @param {boolean} showMilliseconds - 是否显示毫秒
 */
export function updateTimestamp(showMilliseconds = true) {
  const currentTimestamp = document.getElementById('current-timestamp-value');
  const currentTimestampUnit = document.getElementById('current-timestamp-unit');
  const timestamp = Date.now();
  const unit = showMilliseconds ? '毫秒' : '秒';
  currentTimestamp.textContent = showMilliseconds ? timestamp : Math.floor(timestamp / 1000);
  currentTimestampUnit.textContent = unit;
}

/**
 * 转换时间戳为日期格式
 * @param {string} timestamp - 输入的时间戳
 * @param {boolean} isSeconds - 是否为秒格式
 * @returns {string} 格式化后的日期字符串
 */
export function convertTimestampToDate(timestamp, isSeconds) {
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

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 转换日期格式为时间戳
 * @param {string} date - 输入的日期字符串
 * @returns {number|string} 时间戳或错误信息
 */
export function convertDateToTimestamp(date) {
  const timestamp = Date.parse(date);
  return isNaN(timestamp) ? '无效的日期' : timestamp;
}
