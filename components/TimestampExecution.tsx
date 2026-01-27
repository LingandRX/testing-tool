import {useEffect, useState, useRef, useCallback} from "react";
import CopyButton from "./CopyButton";

/**
 * 时间戳显示和执行组件
 *
 * 功能特性：
 * 1. 实时显示当前时间戳（毫秒/秒）
 * 2. 支持毫秒和秒单位切换
 * 3. 支持启动/停止时间戳自动更新
 * 4. 提供复制时间戳功能
 * 5. 响应式设计和良好的可访问性
 *
 * @component
 * @example
 * ```jsx
 * <TimestampExecution />
 * ```
 *
 * @returns {JSX.Element} 时间戳组件
 */
export function TimestampExecution() {
  /** @type {[number, function]} 当前时间戳（毫秒）和更新函数 */
  const [currentTimestamp, setCurrentTimestamp] = useState(() => Math.floor(Date.now()));
  
  /** @type {[boolean, function]} 是否显示毫秒（true=毫秒，false=秒） */
  const [showMilliseconds, setShowMilliseconds] = useState(true);
  
  /** @type {[boolean, function]} 时间戳是否正在自动更新 */
  const [isRunningTimestamp, setIsRunningTimestamp] = useState(true);
  
  /** @type {React.RefObject<NodeJS.Timeout | null>} 定时器引用，用于清理 */
  const timerRef = useRef(null);
  
  /**
   * 计算显示的时间戳值
   * @type {number}
   */
  const displayTimestamp = showMilliseconds
    ? currentTimestamp
    : Math.floor(currentTimestamp / 1000);
  
  /**
   * 计算单位文本
   * @type {string}
   */
  const unitText = showMilliseconds ? '毫秒' : '秒';
  
  /**
   * 定时更新时间戳的副作用
   * 根据 isRunningTimestamp 和 showMilliseconds 控制定时器的启停和间隔
   */
  useEffect(() => {
    // 清除之前的定时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // 如果需要运行，创建新的定时器
    if (isRunningTimestamp) {
      const interval = showMilliseconds ? 100 : 1000;
      timerRef.current = setInterval(() => {
        setCurrentTimestamp(Math.floor(Date.now()));
      }, interval);
    }
    
    // 清理函数
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunningTimestamp, showMilliseconds]);
  
  /**
   * 切换时间戳显示单位（毫秒/秒）
   * @type {function(): void}
   */
  const toggleUnit = useCallback(() => {
    setShowMilliseconds(prev => !prev);
  }, []);
  
  /**
   * 切换时间戳自动更新状态（启动/停止）
   * @type {function(): void}
   */
  const toggleTimestamp = useCallback(() => {
    setIsRunningTimestamp(prev => !prev);
  }, []);
  
  /**
   * 切换单位按钮的辅助文本
   * @type {string}
   */
  const unitButtonLabel = showMilliseconds ? '切换为秒显示' : '切换为毫秒显示';
  
  /**
   * 启动/停止按钮的辅助文本
   * @type {string}
   */
  const toggleButtonLabel = isRunningTimestamp ? '停止时间戳自动更新' : '开始时间戳自动更新';
  
  /**
   * 启动/停止按钮的显示文本
   * @type {string}
   */
  const toggleButtonText = isRunningTimestamp ? '停止' : '开始';
  
  return (
    <div className="timestamp-container">
      <div className="timestamp-display">
        <span className="timestamp-value">{displayTimestamp}</span>
        <span className="timestamp-unit">{unitText}</span>
      </div>
      
      <div className="timestamp-controls">
        <button
          type="button"
          className="timestamp-btn action-btn"
          onClick={toggleUnit}
          aria-label={unitButtonLabel}
          title={unitButtonLabel}
        >
          切换单位
        </button>
        
        <CopyButton
          text={String(currentTimestamp)}
          buttonText="复制时间戳"
          aria-label="复制当前时间戳到剪贴板"
        />
        
        <button
          type="button"
          className={`timestamp-btn ${isRunningTimestamp ? 'stop-btn' : 'action-btn'}`}
          onClick={toggleTimestamp}
          aria-label={toggleButtonLabel}
          title={toggleButtonLabel}
        >
          {toggleButtonText}
        </button>
      </div>
    </div>
  );
}