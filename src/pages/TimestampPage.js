import {useState, useEffect, useRef} from 'react';
import {Link} from 'react-router-dom';

const TimestampPage = () => {
  const [currentTimestamp, setCurrentTimestamp] = useState(Math.floor(Date.now()));
  const [showMilliseconds, setShowMilliseconds] = useState(true);
  const [isRunningTimestamp, setIsRunningTimestamp] = useState(true);
  const intervalRef = useRef(null);
  useEffect(() => {
    if (isRunningTimestamp) {
      intervalRef.current = setInterval(() => {
        setCurrentTimestamp(Math.floor(Date.now()));
      }, 100);
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

  function handleChangeTimestampRunning(status) {
    setIsRunningTimestamp(status);
    if (!status) {
      console.log('停止时间戳')
    } else {
      console.log('开始时间戳')
    }
  }

  return (
    <div id="page-timestamp" class="page">
      <Link to="/" className="btn">
        Back to User List
      </Link>
      <h2>时间戳工具</h2>
      <div id="current-timestamp">
        <h2>当前时间戳</h2>
        <p>
          <span id="current-timestamp-value">{Math.floor(currentTimestamp / (showMilliseconds ? 1 : 1000))}</span>
          <span id="current-timestamp-unit">{showMilliseconds ? '毫秒' : '秒'}</span>
        </p>
        <div>
          <button className="action-btn" onClick={handleChangeUnit}>切换单位</button>
          <button className="action-btn">复制</button>
          <button className="action-btn" onClick={() => handleChangeTimestampRunning(false)}>停止</button>
          <button className="action-btn" onClick={() => handleChangeTimestampRunning(true)}>开始</button>
        </div>
      </div>

      <div>
        <h2>时间戳转日期时间</h2>
        <div class="datetime-box">
          <div class="input-group">
            <input type="text" id="timestamp-input" placeholder="请输入时间戳" class="input-text"/>
            <select id="timestamp-input-unit-select" class="select-box">
              <option value="milliseconds">毫秒(ms)</option>
              <option value="seconds">秒(s)</option>
            </select>
          </div>

          <div class="input-group">
            <button id="convert-timestamp-to-date-btn" className="action-btn">
              转换
            </button>
          </div>

          <div class="input-group">
            <input
              type="text"
              id="timestamp-conversion-result"
              placeholder="转换结果"
              class="input-text"
            />
            <select class="select-box" id="timezone-result"></select>
          </div>
        </div>
      </div>

      <div>
        <h2>日期时间转时间戳</h2>
        <div class="datetime-box">
          <div class="input-group">
            <input type="text" id="datetime-input" placeholder="输入日期时间" class="input-text"/>
            <select class="select-box" id="timezone-input"></select>
          </div>

          <div class="input-group">
            <button id="convert-date-to-timestamp-btn" className="action-btn">
              转换
            </button>
          </div>

          <div class="input-group">
            <input
              type="text"
              id="date-conversion-result"
              placeholder="转换结果"
              class="input-text"
            />
            <select id="date-result-unit-select" class="select-box">
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
