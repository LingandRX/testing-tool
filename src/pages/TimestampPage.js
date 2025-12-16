import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const TimestampPage = () => {
  let showMilliseconds = true;

  useEffect(() => {
    const intervalId = setInterval(() => {
      const timestamp = Math.floor(Date.now() / 1000);
      document.getElementById('current-timestamp-value').textContent = timestamp;
    }, 100);

    return () => clearInterval(intervalId);
  }, []);

  function handleChangeUnit() {
    showMilliseconds = !showMilliseconds;
    document.querySelector('#current-timestamp-unit').textContent = showMilliseconds
      ? '毫秒'
      : '秒';
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
          <span id="current-timestamp-value">1762873747965</span>
          <span id="current-timestamp-unit">毫秒</span>
        </p>
        <div>
          <button id="toggle-unit-btn" className="action-btn" onClick={handleChangeUnit}>
            切换单位
          </button>
          <button id="copy-timestamp-btn" className="action-btn">
            复制
          </button>
          <button id="stop-timer-btn" className="action-btn">
            停止
          </button>
          <button id="start-timer-btn" className="action-btn">
            开始
          </button>
        </div>
      </div>

      <div>
        <h2>时间戳转日期时间</h2>
        <div class="datetime-box">
          <div class="input-group">
            <input type="text" id="timestamp-input" placeholder="请输入时间戳" class="input-text" />
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
            <input type="text" id="datetime-input" placeholder="输入日期时间" class="input-text" />
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
