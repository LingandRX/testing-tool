import { useState, useCallback } from 'react';

/**
 * 时间戳转日期时间组件
 *
 * 功能特性：
 * 1. 将时间戳转换为日期时间字符串
 * 2. 支持多种时区选择
 * 3. 支持毫秒和秒单位切换
 * 4. 提供输入验证和错误提示
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
  const [timestampValue, setTimestampValue] = useState(() => dayjs().valueOf().toString());
  const [timestampResult, setTimestampResult] = useState('');
  const [unit, setUnit] = useState('milliseconds');
  const [selectedZone, setSelectedZone] = useState('Asia/Shanghai');
  const [error, setError] = useState('');

  const performConversion = useCallback(
    (timestampValue: string, selectedZone: string, unit: string) => {
      if (!timestampValue || timestampValue.trim() === '') {
        setError('请输入有效的日期时间');
        return '';
      }

      try {
        const numberValue = Number(timestampValue);
        if (isNaN(numberValue)) {
          setError('时间戳必须是数字');
          return '';
        }

        const d = unit === TIMESTAMP_UNITS[0].value ? dayjs(numberValue) : dayjs.unix(numberValue);

        if (!d.isValid()) {
          setError('无效的时间戳格式');
          return '';
        }

        const dateTime = d.tz(selectedZone).format('YYYY/MM/DD HH:mm:ss');

        setError('');
        return dateTime;
      } catch (err) {
        console.error('转换错误:', err);
        return '';
      }
    },
    [],
  );

  const handleConvert = useCallback(() => {
    const newResult = performConversion(timestampValue, selectedZone, unit);
    setTimestampResult(newResult);
  }, [timestampValue, selectedZone, unit, performConversion]);

  /**
   * 处理时间戳输入变化
   */
  const handleInputChange = useCallback((e) => {
    setTimestampValue(e.target.value);
    setError(''); // 清除错误信息
  }, []);

  /**
   * 处理时区选择变化
   */
  const handleZoneChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newZone = e.target.value;
    setSelectedZone(newZone);
  }, []);

  /**
   * 处理时间戳单位变化
   */
  const handleUnitChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.target.value;
    setUnit(newUnit);
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
            onClick={handleConvert}
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
