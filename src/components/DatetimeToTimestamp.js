import {formatWithDate, formatWithZone, TimezoneOptions} from "../utils/timeUtils";
import {useMemo, useState} from "react";

export function DatetimeToTimestamp() {
  const [dateValue, setDateValue] = useState(() => formatWithZone(Date.now()));
  const [selectedZone, setSelectedZone] = useState('Asia/Shanghai');
  const [result, setResult] = useState('');
  const [unit, setUnit] = useState('milliseconds');
  const timeZoneList = useMemo(() => ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Anchorage', 'America/Honolulu', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Singapore', 'Asia/Dubai', 'Asia/Kolkata', 'Australia/Sydney', 'Pacific/Auckland',], []);
  
  const handleConvertDatetimeToTimestamp = () => {
    const timestamp = unit === 'milliseconds' ? formatWithDate(dateValue, selectedZone) : Math.floor(formatWithDate(dateValue, selectedZone) / 1000);
    setResult(timestamp);
  };
  
  return (<div>
    <h2>日期时间转时间戳</h2>
    <div>
      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
        <input
          type="text"
          placeholder="输入日期时间"
          value={dateValue}
          style={{minWidth: '200px'}}
          onChange={(e) => setDateValue(e.target.value)}/>
        <select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
        >
          <TimezoneOptions zones={timeZoneList}/>
        </select>
      </div>
      
      <div style={{marginBottom: '20px'}}>
        <button
          className={'action-btn'}
          onClick={handleConvertDatetimeToTimestamp}
        >
          转换
        </button>
      </div>
      
      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
        <input
          type="text"
          placeholder="转换结果"
          value={result}
          style={{minWidth: '200px'}}
          readOnly
        />
        <select
          value={unit}
          aria-label='选择时间戳单位'
          onChange={(e) => setUnit(e.target.value)}
        >
          <option value="milliseconds">毫秒(ms)</option>
          <option value="seconds">秒(s)</option>
        </select>
      </div>
    </div>
  </div>);
  
}