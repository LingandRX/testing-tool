import {useEffect, useState} from "react";
import CopyButton from "./CopyButton";

export function TimestampExecution() {
  const [currentTimestamp, setCurrentTimestamp] = useState(Math.floor(Date.now()));
  const [showMilliseconds, setShowMilliseconds] = useState(true);
  const [isRunningTimestamp, setIsRunningTimestamp] = useState(true);
  // 定时更新时间戳
  useEffect(() => {
    const timerId = isRunningTimestamp ? setInterval(() => {
      setCurrentTimestamp(Math.floor(Date.now()));
    }, showMilliseconds ? 100 : 1000) : null;
    
    return () => clearInterval(timerId);
  }, [isRunningTimestamp, showMilliseconds]);
  
  const toggleUnit = () => setShowMilliseconds(prev => !prev);
  const toggleTimestamp = () => setIsRunningTimestamp(prev => !prev);
  
  return (<div>
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
  </div>)
}