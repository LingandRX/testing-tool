import { useState, useCallback } from 'react';
import { formatWithZone } from '../../../utils/timeUtils';

/**
 * 时间戳转日期时间组件
 *
 * 功能特性：
 * 1. 将时间戳转换为日期时间字符串
 * 2. 支持多种时区选择
 * 3. 支持毫秒和秒单位切换
 * 4. 提供输入验证和错误提示
 *
 * @component
 * @example
 * ```jsx
 * <TimestampToDatetime />
 * ```
 *
 * @returns {JSX.Element} 时间戳转日期时间组件
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

export function TimestampToDatetime() {
  /** @type {[string, function]} 输入的时间戳值 */
  const [timestampValue, setTimestampValue] = useState(() => Date.now());

  /** @type {[string, function]} 转换结果 */
  const [timestampResult, setTimestampResult] = useState('');

  /** @type {[string, function]} 时间戳单位 ('milliseconds' | 'seconds') */
  const [unit, setUnit] = useState('milliseconds');

  /** @type {[string, function]} 选择的时区 */
  const [selectedZone, setSelectedZone] = useState('Asia/Shanghai');

  /** @type {[string, function]} 错误信息 */
  const [error, setError] = useState('');

  /**
   * 转换时间戳为日期时间
   * @type {function(): void}
   */
  const handleConvertTimestampToDate = useCallback(() => {
    try {
      setError('');

      if (!timestampValue) {
        setError('请输入时间戳');
        setTimestampResult('');
        return;
      }

      const numericValue = Number(timestampValue);
      if (isNaN(numericValue)) {
        setError('无效的时间戳格式');
        setTimestampResult('');
        return;
      }

      const result = formatWithZone(numericValue, selectedZone, unit);
      setTimestampResult(result);
    } catch (err) {
      console.error('转换时间戳出错:', err);
      setError('转换失败，请检查输入格式');
      setTimestampResult('');
    }
  }, [timestampValue, selectedZone, unit]);

  /**
   * 处理时间戳输入变化
   * @type {function(React.ChangeEvent<HTMLInputElement>): void}
   */
  const handleInputChange = useCallback((e) => {
    setTimestampValue(e.target.value);
    setError(''); // 清除错误信息
  }, []);

  /**
   * 处理时区选择变化
   * @type {function(React.ChangeEvent<HTMLSelectElement>): void}
   */
  const handleZoneChange = useCallback((e) => {
    setSelectedZone(e.target.value);
  }, []);

  /**
   * 处理时间戳单位变化
   * @type {function(React.ChangeEvent<HTMLSelectElement>): void}
   */
  const handleUnitChange = useCallback((e) => {
    setUnit(e.target.value);
  }, []);

  return (
    <div className="datetime-converter">
      <h2 className="converter-title">时间戳转日期时间</h2>

      <div className="converter-form">
        <div className="input-group">
          <input
            type="number"
            placeholder="输入时间戳 (如: 1704067200000)"
            value={timestampValue}
            className="datetime-input"
            onChange={handleInputChange}
            aria-label="输入要转换的时间戳"
            title="支持毫秒或秒为单位的时间戳"
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

        {error && (
          <div className="error-message" role="alert">
            ⚠️ {error}
          </div>
        )}

        <div className="action-group">
          <button
            className="converter-btn action-btn"
            onClick={handleConvertTimestampToDate}
            aria-label="转换时间戳为日期时间"
          >
            转换
          </button>
        </div>

        <div className="result-group">
          <input
            type="text"
            placeholder="转换结果"
            value={timestampResult}
            className="result-input"
            readOnly
            aria-label="转换结果"
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
      </div>
    </div>
  );
}
