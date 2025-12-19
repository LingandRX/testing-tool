import {useMemo, useState} from "react";
import {formatWithZone, TimezoneOptions} from "../utils/timeUtils";

export function TimestampToDatetime() {
  const [timestampValue, setTimestampValue] = useState(Date.now());
  const [timestampResult, setTimestampResult] = useState('');
  const [unit, setUnit] = useState('milliseconds');
  const [selectedZone, setSelectedZone] = useState('Asia/Shanghai');
  const timeZoneList = useMemo(() => ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Anchorage', 'America/Honolulu', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Singapore', 'Asia/Dubai', 'Asia/Kolkata', 'Australia/Sydney', 'Pacific/Auckland',], []);
  
  function handleConvertTimestampToDate() {
    if (!timestampValue) {
      setTimestampResult('请输入时间戳');
      return;
    }
    
    const result = formatWithZone(timestampValue, selectedZone, unit);
    setTimestampResult(result);
  }
  
  const handleInputChange = (e) => setTimestampValue(e.target.value);
  
  return (
    <div>
      <h2>时间戳转日期时间</h2>
      <div>
        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
          <input
            type="number"
            placeholder="请输入时间戳"
            value={timestampValue}
            onChange={handleInputChange}
            style={{minWidth: '200px'}}
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
        
        <div style={{marginBottom: '20px'}}>
          <button className={'action-btn'} onClick={handleConvertTimestampToDate}>
            转换
          </button>
        </div>
        
        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
          <input
            type="text"
            placeholder="转换结果"
            value={timestampResult}
            readOnly
            style={{minWidth: '200px'}}
          />
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
          >
            <TimezoneOptions zones={timeZoneList}/>
          </select>
        </div>
      </div>
    </div>
  )
}