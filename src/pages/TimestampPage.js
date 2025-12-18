import {useState, useEffect} from 'react';
import CopyButton from "../components/CopyButton";
import {formatDate} from "../utils/timeUtils";

const TimestampPage = () => {
  const [currentTimestamp, setCurrentTimestamp] = useState(Math.floor(Date.now()));
  const [showMilliseconds, setShowMilliseconds] = useState(true);
  const [isRunningTimestamp, setIsRunningTimestamp] = useState(true);
  const [timestampValue, setTimestampValue] = useState(Date.now());
  const [dateValue, setDateValue] = useState(formatDate(Date.now()));
  const [timestampResult, setTimestampResult] = useState('');
  const [dateResult, setDateResult] = useState('');
  
  // 定时更新时间戳
  useEffect(() => {
    let timerId = null;
    
    if (isRunningTimestamp) {
      timerId = setInterval(() => {
        setCurrentTimestamp(Math.floor(Date.now()));
      }, 1000);
    }
    
    return () => {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    }
  }, [isRunningTimestamp]);
  
  function toggleUnit() {
    setShowMilliseconds(prev => !prev);
  }
  
  function toggleTimestamp() {
    setIsRunningTimestamp((prev => !prev));
  }
  
  function handleConvertTimestampToDate() {
    if (!timestampValue) {
      setTimestampResult('请输入时间戳');
      return;
    }
    
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
      <div>
        <h2>当前时间戳</h2>
        <p>
          <span>{Math.floor(currentTimestamp / (showMilliseconds ? 1 : 1000))}</span>
          <span>{showMilliseconds ? '毫秒' : '秒'}</span>
        </p>
        <div>
          <button type="button"
                  className="action-btn"
                  onClick={toggleUnit}
                  aria-label={showMilliseconds ? '切换为秒' : '切换为毫秒'}
          >
            切换单位
          </button>
          <CopyButton text={currentTimestamp.toString()} buttonText='复制'></CopyButton>
          <button
            type="button" // 明确指定类型，防止在 Form 中意外触发提交
            className={`btn ${isRunningTimestamp ? 'stop-btn' : 'action-btn'}`}
            onClick={toggleTimestamp}
            aria-label={isRunningTimestamp ? '停止时间戳更新' : '开始时间戳更新'}
          >
            {isRunningTimestamp ? '停止' : '开始'}
          </button>
        </div>
      </div>
      
      <div>
        <h2>时间戳转日期时间</h2>
        <div>
          <div>
            <input
              type="text"
              placeholder="请输入时间戳"
              value={timestampValue}
              onChange={(e) => setTimestampValue(Number(e.target.value))}/>
            <label aria-label={'选择时间戳单位'}>
              <select name='时间戳单位' defaultChecked='milliseconds'>
                <option value="milliseconds">毫秒(ms)</option>
                <option value="seconds">秒(s)</option>
              </select>
            </label>
          </div>
          
          <div>
            <button className={'action-btn'} onClick={handleConvertTimestampToDate}>
              转换
            </button>
          </div>
          
          <div>
            <input
              type="text"
              placeholder="转换结果"
              value={timestampResult}
              readOnly
            />
            <select></select>
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
