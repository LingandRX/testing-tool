import {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import CopyButton from "../components/CopyButton";

function formatDate(value) {
  return (new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  })).format(value);
}

const TimestampPage = () => {
  const [currentTimestamp, setCurrentTimestamp] = useState(Math.floor(Date.now()));
  const [showMilliseconds, setShowMilliseconds] = useState(true);
  const [isRunningTimestamp, setIsRunningTimestamp] = useState(true);
  const intervalRef = useRef(null);
  const [timestampValue, setTimestampValue] = useState(Date.now());
  const [dateValue, setDateValue] = useState(formatDate(Date.now()));
  const [timestampResult, setTimestampResult] = useState('');
  const [dateResult, setDateResult] = useState('');
  
  useEffect(() => {
    if (isRunningTimestamp) {
      intervalRef.current = setInterval(() => {
        setCurrentTimestamp(Math.floor(Date.now()));
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [isRunningTimestamp]);
  
  function handleChangeUnit() {
    setShowMilliseconds(!showMilliseconds);
  }
  
  const handleToggleTimestampRunning = useCallback(() => {
    const newStatus = !isRunningTimestamp;
    setIsRunningTimestamp(newStatus);
    console.log(newStatus ? '开始时间戳' : '停止时间戳');
  }, [isRunningTimestamp]);
  useMemo(() => ({
    backgroundColor: isRunningTimestamp ? 'red' : 'green'
  }), [isRunningTimestamp]);
  
  function handleConvertTimestampToDate() {
    setTimestampResult(formatDate(new Date(Number(timestampValue))));
  }
  
  function handleConvertDateToTimestamp() {
    if (!dateValue) {
      setDateResult('请输入日期222');
      return;
    }
    
    const date = new Date(dateValue);
    
    if (isNaN(date.getTime())) {
      setDateResult('请输入日期333');
      return;
    }
    
    setDateResult(date.getTime());
  }
  
  return (
    <div>
      <div id="current-timestamp">
        <h2>当前时间戳</h2>
        <p>
          <span id="current-timestamp-value">{Math.floor(currentTimestamp / (showMilliseconds ? 1 : 1000))}</span>
          <span id="current-timestamp-unit">{showMilliseconds ? '毫秒' : '秒'}</span>
        </p>
        <div>
          <button className="action-btn" onClick={handleChangeUnit}>切换单位</button>
          <CopyButton text={currentTimestamp.toString()} buttonText='复制'></CopyButton>
          <button className={isRunningTimestamp ? 'stop-btn' : 'action-btn'}
                  onClick={handleToggleTimestampRunning}>
            {isRunningTimestamp ? '停止' : '开始'}
          </button>
        </div>
      </div>
      
      <div>
        <h2>时间戳转日期时间</h2>
        <div className="datetime-box">
          <div className="input-group">
            <input type="text" id="timestamp-input" placeholder="请输入时间戳" className="input-text"
                   value={timestampValue} onChange={(e) => setTimestampValue(e.target.value)}/>
            <select id="timestamp-input-unit-select" className="select-box">
              <option value="milliseconds">毫秒(ms)</option>
              <option value="seconds">秒(s)</option>
            </select>
          </div>
          
          <div className="input-group">
            <button id="convert-timestamp-to-date-btn" className="action-btn" onClick={handleConvertTimestampToDate}>
              转换
            </button>
          </div>
          
          <div className="input-group">
            <input
              type="text"
              id="timestamp-conversion-result"
              placeholder="转换结果"
              className="input-text"
              value={timestampResult}
              readOnly
            />
            <select className="select-box" id="timezone-result"></select>
          </div>
        </div>
      </div>
      
      <div>
        <h2>日期时间转时间戳</h2>
        <div className="datetime-box">
          <div className="input-group">
            <input type="text" id="datetime-input" placeholder="输入日期时间" className="input-text" value={dateValue}
                   onChange={(e) => setDateValue(e.target.value)}/>
            <select className="select-box" id="timezone-input"></select>
          </div>
          
          <div className="input-group">
            <button id="convert-date-to-timestamp-btn" className="action-btn" onClick={handleConvertDateToTimestamp}>
              转换
            </button>
          </div>
          
          <div className="input-group">
            <input
              type="text"
              id="date-conversion-result"
              placeholder="转换结果"
              className="input-text"
              value={dateResult}
              readOnly
            />
            <select id="date-result-unit-select" className="select-box">
              <option value="milliseconds">毫秒(ms)</option>
              <option value="seconds">秒(s)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimestampPage;
