export const formatWithZone = (
  timestamp: number | string,
  zone = 'Asia/Shanghai',
  unit = 'milliseconds',
) => {
  try {
    const ms = unit === 'milliseconds' ? Number(timestamp) : Number(timestamp) * 1000;
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZone: zone,
    }).format(ms);
  } catch (e) {
    return '格式错误';
  }
};

export const getTimeZoneOffset = (timeZone: string) => {
  const now = new Date();
  const utc = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
  const target = new Date(now.toLocaleString('en-US', { timeZone: timeZone }));
  return target.getTime() - utc.getTime();
};

export const formatWithDate = (
  date: string,
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
) => {
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

      return utc + targetOffset;
    } else {
      return dateObj.getTime();
    }
  } catch (error) {
    return '日期转换错误: ' + error;
  }
};
