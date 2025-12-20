import './TodoMarkdownEditor.css';
import ReactMarkdown from "react-markdown";
import {useState, useRef} from "react";

const TodoMarkdownEditor = () => {
  const [markdown, setMarkdown] = useState('# Hello, world!\n\nThis is a simple paragraph with some **bold** text.');
  const textareaRef = useRef(null);
  const handleClear = () => {
    setMarkdown('');
  };
  
  const handleReset = () => {
    setMarkdown('# Hello, world!\n\nThis is a simple paragraph with some **bold** text.');
  };
  
  return (<div className="markdown-editor">
    <div className="editor-container">
      <div className="preview-section">
        <label>预览区</label>
        <div className="markdown-preview">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      </div>
      
      <div className="input-section">
        <label htmlFor="markdown-input">编辑区</label>
        <textarea
          id="markdown-input"
          ref={textareaRef}
          placeholder="输入Markdown内容..."
          className="markdown-input"
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
        />
      </div>
      
      <div className="toolbar">
        <div className="toolbar-section">
          <button className="action-button clear-button" onClick={handleClear}>
            清空
          </button>
          <button className="action-button reset-button" onClick={handleReset}>
            重置
          </button>
        </div>
      </div>
    </div>
  </div>);
};

export default TodoMarkdownEditor;