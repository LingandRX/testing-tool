import { formatWithDate, formatWithZone } from '../../../utils/timeUtils';
import { useState, useCallback } from 'react';

/**
 * 日期时间转时间戳组件
 *
 * 功能特性：
 * 1. 将日期时间字符串转换为时间戳
 * 2. 支持多种时区选择
 * 3. 支持毫秒和秒单位切换
 * 4. 提供输入验证和错误提示
 * 5. 实时单位转换
 *
 * @component
 * @example
 * ```jsx
 * <DatetimeToTimestamp />
 * ```
 *
 * @returns {JSX.Element} 日期时间转时间戳组件
 */

// 常用时区列表
const TIME_ZONE_LIST = [
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

// 时间戳单位选项
const TIMESTAMP_UNITS = [
  { value: 'milliseconds', label: '毫秒(ms)' },
  { value: 'seconds', label: '秒(s)' },
];

export function DatetimeToTimestamp() {
  const [dateValue, setDateValue] = useState(() => formatWithZone(Date.now(), 'Asia/Shanghai'));

  const [selectedZone, setSelectedZone] = useState('Asia/Shanghai');

  const [result, setResult] = useState('');

  const [unit, setUnit] = useState('milliseconds');

  const [error, setError] = useState('');

  /**
   * 转换日期时间为时间戳
   */
  const handleConvertDatetimeToTimestamp = useCallback(() => {
    try {
      setError('');
      const timestamp = formatWithDate(dateValue, selectedZone);

      if (typeof timestamp !== 'number' || isNaN(timestamp)) {
        setError('无效的日期时间格式');
        setResult('');
        return;
      }

      const finalResult = unit === 'milliseconds' ? timestamp : Math.floor(timestamp / 1000);

      setResult(finalResult.toString());
    } catch (err) {
      console.error('转换错误:', err);
      setError('转换失败，请检查输入格式');
      setResult('');
    }
  }, [dateValue, selectedZone, unit]);

  /**
   * 处理日期时间输入变化
   */
  const handleDateChange = useCallback((e) => {
    setDateValue(e.target.value);
    setError(''); // 清除错误信息
  }, []);

  /**
   * 处理时区选择变化
   */
  const handleZoneChange = useCallback((e) => {
    setSelectedZone(e.target.value);
  }, []);

  /**
   * 处理时间戳单位变化
   */
  const handleUnitChange = useCallback(
    (e) => {
      const newUnit = e.target.value;
      setUnit(newUnit);

      // 如果已有结果，重新计算
      if (result) {
        const currentResult = parseInt(result, 10);
        if (!isNaN(currentResult)) {
          const newResult =
            newUnit === 'milliseconds' ? currentResult * 1000 : Math.floor(currentResult / 1000);
          setResult(newResult.toString());
        }
      }
    },
    [result],
  );

  return (
    <div className="datetime-converter">
      <h2 className="converter-title">日期时间转时间戳</h2>

      <div className="converter-form">
        <div className="input-group">
          <input
            type="text"
            placeholder="输入日期时间 (如: 2024-01-01 12:00:00)"
            value={dateValue}
            className="datetime-input"
            onChange={handleDateChange}
            aria-label="输入要转换的日期时间"
            title="支持格式: YYYY-MM-DD HH:mm:ss"
          />
          <select
            value={selectedZone}
            className="timezone-select"
            onChange={handleZoneChange}
            aria-label="选择时区"
          >
            {TIME_ZONE_LIST.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="error-message" role="alert">
            ⚠️ {error}
          </div>
        )}

        <div className="action-group">
          <button
            className="converter-btn action-btn"
            onClick={handleConvertDatetimeToTimestamp}
            aria-label="转换日期时间为时间戳"
          >
            转换
          </button>
        </div>

        <div className="result-group">
          <input
            type="text"
            placeholder="转换结果"
            value={result}
            className="result-input"
            readOnly
            aria-label="转换结果"
          />
          <select
            value={unit}
            className="unit-select"
            onChange={handleUnitChange}
            aria-label="选择时间戳单位"
          >
            {TIMESTAMP_UNITS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
