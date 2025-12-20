import React, {useState, useCallback, useEffect, useRef} from 'react';
import dzmyImg from '../assets/images/dzmy.png';
import './ElectronicWoodenFish.css';
import storageAdapter from "../utils/storageAdapter";

const MAX_TIP_LIST_SIZE = 50; // 最大提示数量限制

const ElectronicWoodenFishPage = () => {
  const [active, setActive] = useState(false);
  const [count, setCount] = useState(0);
  const [tipList, setTipList] = useState([]);
  const [countName, setCountName] = useState('金钱');
  
  // Refs for cleanup and avoiding stale closures
  const timerRef = useRef(null);
  const countNameRef = useRef(countName);
  const tipTimersRef = useRef(new Map());
  const firstRenderRef = useRef(true);
  const storageTimerRef = useRef(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      try {
        const [savedCount, savedCountName] = await Promise.all([
          storageAdapter.get('count'),
          storageAdapter.get('countName')
        ]);
        
        if (!isMounted) return;
        
        // 处理 count：确保是有效数字
        let validCount = 0;
        console.log('初始化存储数据:', savedCount, savedCountName);
        if (savedCount !== undefined && savedCount !== null) {
          const num = Number(savedCount);
          if (!isNaN(num) && isFinite(num) && num >= 0) {
            validCount = Math.floor(num); // 取整，确保是整数
          }
        }
        setCount(validCount);
        // 如果存储的值无效或不存在，更新存储
        if (savedCount !== validCount) {
          await storageAdapter.set('count', validCount);
        }
        
        // 处理 countName：确保是有效非空字符串
        let validCountName = '金钱';
        if (typeof savedCountName === 'string') {
          const trimmed = savedCountName.trim();
          // 拒绝空字符串、'undefined'、'null'等无效值
          if (trimmed.length > 0 &&
            trimmed.toLowerCase() !== 'undefined' &&
            trimmed.toLowerCase() !== 'null' &&
            trimmed !== 'NaN') {
            validCountName = trimmed;
          }
        }
        setCountName(validCountName);
        // 如果存储的值无效或不存在，更新存储
        if (savedCountName !== validCountName) {
          await storageAdapter.set('countName', validCountName);
        }
      } catch (error) {
        console.error('初始化存储数据失败:', error);
        // 静默失败，使用默认值
        if (isMounted) {
          setCount(0);
          setCountName('金钱');
        }
      }
    };
    
    init();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  // 同步 countName 到 ref，避免闭包问题
  useEffect(() => {
    countNameRef.current = countName;
  }, [countName]);
  
  // 存储 countName 变化（防抖处理）
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    
    // 清理之前的定时器
    if (storageTimerRef.current) {
      clearTimeout(storageTimerRef.current);
    }
    
    // 防抖存储：500ms 后存储
    storageTimerRef.current = setTimeout(async () => {
      try {
        await storageAdapter.set('countName', countName);
      } catch (error) {
        console.error('存储 countName 失败:', error);
      }
    }, 500);
    
    return () => {
      if (storageTimerRef.current) {
        clearTimeout(storageTimerRef.current);
      }
    };
  }, [countName]);
  
  // 组件卸载时清理所有定时器
  useEffect(() => {
    return () => {
      // 清理动画定时器
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      // 清理所有 tip 定时器
      tipTimersRef.current.forEach((timer) => {
        clearTimeout(timer);
      });
      tipTimersRef.current.clear();
      
      // 清理存储定时器
      if (storageTimerRef.current) {
        clearTimeout(storageTimerRef.current);
        storageTimerRef.current = null;
      }
    };
  }, []);
  
  const clickAnimation = useCallback(async () => {
    try {
      // 1. 木鱼缩放动画 - 使用 requestAnimationFrame 优化时序
      setActive(true);
      
      // 清理之前的动画定时器
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // 设置动画结束定时器
      timerRef.current = setTimeout(() => {
        setActive(false);
        timerRef.current = null;
      }, 100);
      
      // 2. 更新计数并获取新值，同时执行存储
      setCount((prev) => {
        const newCount = prev + 1;

        // 异步存储更新（不阻塞 UI）
        const storagePromises = [
          storageAdapter.set('count', newCount),
          storageAdapter.set('countName', countNameRef.current)
        ];

        // 使用 Promise.all 并行存储，但忽略错误（静默失败）
        Promise.all(storagePromises).catch(error => {
          console.error('存储更新失败:', error);
          // 可以选择重试或记录错误
        });

        return newCount;
      });

      // 3. 生成唯一的 Tip 对象
      const tipId = `tip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newTip = {
        id: tipId,
        // 使用当前 countName（通过 ref 获取最新值）
        label: `${countNameRef.current} +1`
      };

      // 4. 添加到列表（限制最大长度）
      setTipList((prev) => {
        const newList = [...prev, newTip];
        // 如果超过最大长度，移除最旧的 tip
        if (newList.length > MAX_TIP_LIST_SIZE) {
          const removedTip = newList.shift(); // 移除第一个元素
          // 清理被移除 tip 的定时器
          const removedTimer = tipTimersRef.current.get(removedTip.id);
          if (removedTimer) {
            clearTimeout(removedTimer);
            tipTimersRef.current.delete(removedTip.id);
          }
        }
        return newList;
      });

      // 5. 自动移除：500ms 后删除该特定 Tip
      const removalTimer = setTimeout(() => {
        setTipList((prev) => prev.filter((t) => t.id !== tipId));
        tipTimersRef.current.delete(tipId);
      }, 500);

      tipTimersRef.current.set(tipId, removalTimer);
      
    } catch (error) {
      console.error('点击动画执行失败:', error);
      // 确保动画状态重置
      setActive(false);
    }
  }, []); // 无依赖，使用 refs 获取最新状态
  
  const resetAll = async () => {
    try {
      // 清理所有 tip 定时器
      tipTimersRef.current.forEach((timer) => {
        clearTimeout(timer);
      });
      tipTimersRef.current.clear();
      
      // 清理动画定时器
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      // 重置状态
      setCount(0);
      setTipList([]);
      setCountName('金钱');
      
      // 同时更新 ref
      countNameRef.current = '金钱';
      
      // 异步存储重置（不阻塞 UI）
      const storagePromises = [
        storageAdapter.set('count', 0),
        storageAdapter.set('countName', '金钱')
      ];

      Promise.all(storagePromises).catch(error => {
        console.error('重置存储失败:', error);
      });
    } catch (error) {
      console.error('重置操作失败:', error);
    }
  }
  
  return (
    <div>
      <div className="dzmy-bg">
        <div className="dzmy-count">{countName}: {count}</div>
        
        <div className="dzmy-box">
          <div className="tips">
            {tipList.map((tip) => (
              <div key={tip.id} className="tip-item">
                {tip.label}
              </div>
            ))}
          </div>
          
          <img
            alt="电子木鱼"
            src={dzmyImg}
            className={`dzmy-img ${active ? 'active' : ''}`}
            onClick={clickAnimation}
          />
        </div>
      </div>
      <div className={'dzmy-controls'}>
        <input
          type="text"
          value={countName}
          onChange={(e) => setCountName(e.target.value)}
        />
        <button
          className={'action-btn'}
          onClick={resetAll}>重置
        </button>
      </div>
    </div>
  );
};

export default ElectronicWoodenFishPage;