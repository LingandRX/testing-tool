import React, {useEffect} from 'react';
import {db} from '../utils/db';
import {useLiveQuery} from 'dexie-react-hooks';

// 样式简单写一下，实际可以用 styled-components 或 css modules
const styles = {
  container: {padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto'},
  uploadBox: {
    border: '2px dashed #aaa',
    padding: '40px',
    textAlign: 'center',
    background: '#f9f9f9',
    marginBottom: '20px',
    borderRadius: '8px'
  },
  grid: {display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px'},
  card: {border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', position: 'relative'},
  img: {width: '100%', height: '120px', objectFit: 'cover', display: 'block'},
  delBtn: {
    position: 'absolute',
    top: '5px',
    right: '5px',
    background: 'red',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    padding: '2px 8px',
    borderRadius: '4px'
  }
};

const TestPage = () => {
  const images = useLiveQuery(() => db.images.orderBy('created').reverse().toArray());
  
  // --- FIX 2: 修复重复粘贴问题 ---
  useEffect(() => {
    const handlePaste = async (event) => {
      // 1. 获取剪贴板数据
      const items = (event.clipboardData || event.originalEvent.clipboardData).items;
      
      // 2. 找到第一个图片文件 (防止一次粘贴循环出多个格式)
      let foundImage = false;
      
      for (let item of items) {
        if (!foundImage && item.kind === 'file' && item.type.includes('image/')) {
          const blob = item.getAsFile();
          foundImage = true; // 标记已找到，避免重复处理
          
          // 3. 阻止默认行为（防止浏览器把图片直接贴到页面上）
          event.preventDefault();
          
          await db.images.add({
            blob: blob,
            created: new Date(),
            source: 'Paste'
          });
          
          console.log('图片已添加');
        }
      }
    };
    
    // 添加监听
    window.addEventListener('paste', handlePaste);
    
    // ★★★ 关键：必须返回一个清理函数，组件刷新时移除旧的监听器 ★★★
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, []); // ★★★ 关键：依赖数组必须为空 []，保证只在挂载时绑定一次
  
  
  // --- FIX 1: 修复删除变增加的问题 ---
  const handleDelete = async (event, id) => {
    // ★★★ 关键：阻止事件冒泡，防止触发父级的点击或粘贴逻辑
    event.stopPropagation();
    
    try {
      await db.images.delete(id);
      console.log('删除成功 ID:', id);
    } catch (error) {
      console.error('删除失败:', error);
    }
  };
  
  return (
    <div style={styles.container}>
      <h2>React 图片采集器 (已修复)</h2>
      <p>点击任意处粘贴 (Ctrl+V)</p>
      
      <div style={styles.grid}>
        {images?.map((img) => (
          <div key={img.id} style={styles.card}>
            <img src={URL.createObjectURL(img.blob)} alt="screenshot" style={styles.img}/>
            
            {/* 传递 event 对象给 handleDelete */}
            <button
              style={styles.delBtn}
              onClick={(e) => handleDelete(e, img.id)}
            >
              删除
            </button>
          
          </div>
        ))}
      </div>
    </div>
  );
}

export default TestPage;