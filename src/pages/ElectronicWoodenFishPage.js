import React, {useState, useCallback, useEffect} from 'react';
import dzmyImg from '../assets/images/dzmy.png';
import './ElectronicWoodenFish.css';
import storageAdapter from "../utils/storageAdapter";

const ElectronicWoodenFishPage = () => {
  const [active, setActive] = useState(false);
  const [count, setCount] = useState(0);
  const [tipList, setTipList] = useState([]);
  const [countName, setCountName] = useState('金钱');
  
  useEffect(() => {
    const init = async () => {
      const savedCount = await storageAdapter.get('count');
      const savedCountName = await storageAdapter.get('countName');
      if (savedCount) {
        setCount(savedCount);
      } else {
        await storageAdapter.set('count', 0);
      }
      if (savedCountName) {
        setCountName(savedCountName);
      } else {
        await storageAdapter.set('countName', '金钱');
      }
    }
    init();
  }, []);
  
  const clickAnimation = useCallback(async () => {
    // 1. 木鱼缩放动画触发
    setActive(true);
    setTimeout(() => setActive(false), 100);
    
    // 2. 更新计数
    setCount((prev) => prev + 1);
    
    // 3. 生成唯一的 Tip 对象
    const newTip = {
      id: Date.now() + Math.random(), // 唯一 ID
      value: count + 1
    };
    
    // 4. 添加到列表
    setTipList((prev) => [...prev, newTip]);
    
    // 5. 自动移除：500ms 后删除该特定 Tip
    setTimeout(() => {
      setTipList((prev) => prev.filter((t) => t.id !== newTip.id));
    }, 500);
    
    await storageAdapter.set('count', count + 1);
    await storageAdapter.set('countName', countName);
  }, [count]);
  
  const resetAll = () => {
    setCount(0);
    setTipList([]);
    setCountName('金钱');
  }
  
  return (
    <div>
      <div className="dzmy-bg">
        <div className="dzmy-count">{countName}: {count}</div>
        
        <div className="dzmy-box">
          <div className="tips">
            {tipList.map((tip) => (
              <div key={tip.id} className="tip-item">
                {countName} +1
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