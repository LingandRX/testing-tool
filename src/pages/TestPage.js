import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import "./TestPage.css";

const TestPage = () => {
  // 待办列表数据: { id, content, createdAt }
  const [todos, setTodos] = useState(() => {
    // 从 localStorage 初始化，保证刷新不丢失
    const saved = localStorage.getItem('markdown-todos');
    return saved ? JSON.parse(saved) : [];
  });

  // UI 状态
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState(null); // 当前正在编辑的 ID，null 表示新增

  // 持久化存储
  useEffect(() => {
    localStorage.setItem('markdown-todos', JSON.stringify(todos));
  }, [todos]);

  // --- 核心逻辑：数据处理 ---

  // 1. 处理提交
  const handleSubmit = () => {
    if (!inputValue.trim()) return;

    if (editingId) {
      // 编辑模式
      setTodos(prev => prev.map(item => 
        item.id === editingId ? { ...item, content: inputValue } : item
      ));
    } else {
      // 新增模式
      const newTodo = {
        id: Date.now(),
        content: inputValue,
        createdAt: Date.now(),
      };
      setTodos(prev => [...prev, newTodo]);
    }

    // 重置并关闭
    setInputValue('');
    setEditingId(null);
    setIsInputVisible(false);
  };

  // 2. 处理点击待办（进入编辑）
  const handleEditClick = (todo) => {
    setInputValue(todo.content);
    setEditingId(todo.id);
    setIsInputVisible(true);
  };

  // 3. 处理取消/关闭
  const handleCancel = () => {
    setIsInputVisible(false);
    setInputValue('');
    setEditingId(null);
  };

  // 4. 数据分组与排序 (核心需求 4)
  const groupedTodos = useMemo(() => {
    const groups = {};

    todos.forEach(todo => {
      // 第一层 Key: 日期 (例如 2023-10-27)
      const dateKey = format(todo.createdAt, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(todo);
    });

    // 将对象转为数组以便排序渲染
    const groupArray = Object.keys(groups).map(date => ({
      date,
      items: groups[date]
    }));

    // 第一层排序：按日期倒序
    groupArray.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 第二层排序：组内按添加时间倒序
    groupArray.forEach(group => {
      group.items.sort((a, b) => b.createdAt - a.createdAt);
    });

    return groupArray;
  }, [todos]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h2>Markdown Todo Tree</h2>
        {/* 如果没打开输入框，显示添加按钮 */}
        {!isInputVisible && (
          <button className="btn-primary" onClick={() => setIsInputVisible(true)}>
            + 新增待办
          </button>
        )}
      </header>

      {/* 输入区域 (Markdown) */}
      {isInputVisible && (
        <div className="input-area">
          <textarea
            className="markdown-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="支持 Markdown 语法，例如：# 标题 或 - 列表"
            autoFocus
          />
          <div className="action-buttons">
            <button className="btn-save" onClick={handleSubmit}>
              {editingId ? "更新" : "保存"}
            </button>
            <button className="btn-cancel" onClick={handleCancel}>
              取消
            </button>
          </div>
        </div>
      )}

      {/* 树状列表展示区域 */}
      <div className="todo-tree">
        {groupedTodos.length === 0 && <p className="empty-tip">暂无待办，点击上方添加</p>}

        {groupedTodos.map((group) => (
          // 使用 details/summary 原生标签实现折叠/展开
          <details key={group.date} open className="date-group">
            <summary className="date-header">
              {group.date} <span className="count-badge">{group.items.length}</span>
            </summary>

            <div className="todo-list">
              {group.items.map((todo) => (
                <div
                  key={todo.id}
                  className="todo-item"
                  onClick={() => handleEditClick(todo)}
                  title="点击编辑"
                >
                  <div className="time-tag">{format(todo.createdAt, "HH:mm")}</div>
                  <div className="markdown-content">
                    {/* 预览渲染 */}
                    <ReactMarkdown>{todo.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};

export default TestPage;
