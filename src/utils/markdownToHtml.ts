import { marked, type MarkedOptions } from 'marked';

/**
 * Markdown 转 HTML 转换结果
 */
export interface MarkdownToHtmlResult {
  /** 转换后的 HTML 字符串 */
  html: string;
  /** 原始 Markdown 文本长度 */
  originalLength: number;
  /** 生成的 HTML 长度 */
  htmlLength: number;
  /** 是否包含错误 */
  hasError: boolean;
  /** 错误信息（如果有） */
  error?: string;
}

/**
 * 默认的 Markdown 渲染选项配置
 */
const defaultMarkedOptions: MarkedOptions = {
  gfm: true,
  breaks: true,
};

/**
 * 将 Markdown 文本转换为 HTML
 *
 * @param markdown - Markdown 源文本
 * @returns MarkdownToHtmlResult 转换结果
 */
export function markdownToHtml(markdown: string): MarkdownToHtmlResult {
  try {
    const trimmed = markdown.trim();
    if (!trimmed) {
      return {
        html: '',
        originalLength: 0,
        htmlLength: 0,
        hasError: false,
      };
    }

    const html = marked.parse(trimmed, { ...defaultMarkedOptions, async: false });

    return {
      html: html.trim(),
      originalLength: markdown.length,
      htmlLength: html.length,
      hasError: false,
    };
  } catch (error) {
    return {
      html: '',
      originalLength: markdown.length,
      htmlLength: 0,
      hasError: true,
      error: error instanceof Error ? error.message : 'Markdown 解析失败',
    };
  }
}

/**
 * 为 HTML 内容包装完整的文档结构（用于打印/下载）
 *
 * @param html - 主体 HTML 内容
 * @param title - 文档标题
 * @returns 完整的 HTML 文档字符串
 */
export function wrapHtmlDocument(html: string, title: string = 'Markdown Export'): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      background: #fff;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }
    h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
    h3 { font-size: 1.25em; }
    p { margin-top: 0; margin-bottom: 16px; }
    a { color: #0366d6; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code {
      background-color: rgba(27, 31, 35, 0.05);
      border-radius: 3px;
      font-size: 85%;
      margin: 0;
      padding: 0.2em 0.4em;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    }
    pre {
      background-color: #f6f8fa;
      border-radius: 6px;
      font-size: 85%;
      line-height: 1.45;
      overflow: auto;
      padding: 16px;
    }
    pre code {
      background-color: transparent;
      border: 0;
      display: inline;
      line-height: inherit;
      margin: 0;
      overflow: visible;
      padding: 0;
      word-wrap: normal;
    }
    blockquote {
      border-left: 0.25em solid #dfe2e5;
      color: #6a737d;
      margin: 0;
      padding: 0 1em;
    }
    ul, ol { margin-top: 0; margin-bottom: 16px; padding-left: 2em; }
    li + li { margin-top: 0.25em; }
    img { max-width: 100%; box-sizing: content-box; }
    table {
      border-collapse: collapse;
      border-spacing: 0;
      display: block;
      overflow: auto;
      width: 100%;
    }
    table th, table td {
      border: 1px solid #dfe2e5;
      padding: 6px 13px;
    }
    table tr:nth-child(2n) { background-color: #f6f8fa; }
    table th { font-weight: 600; background-color: #f6f8fa; }
    hr {
      background-color: #e1e4e8;
      border: 0;
      height: 0.25em;
      margin: 24px 0;
      padding: 0;
    }
    input[type="checkbox"] { margin-right: 0.5em; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
}

/**
 * 转义 HTML 特殊字符
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 下载 HTML 文件
 *
 * @param content - 文件内容
 * @param filename - 下载文件名
 */
export function downloadHtmlFile(content: string, filename: string = 'export.html'): void {
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 打印 HTML 内容
 *
 * @param html - 要打印的 HTML 内容
 * @param title - 打印窗口标题
 */
export function printHtml(html: string, title: string = 'Markdown Preview'): void {
  const doc = wrapHtmlDocument(html, title);
  const blob = new Blob([doc], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const printWindow = window.open(url, '_blank', 'width=800,height=600');
  if (!printWindow) {
    URL.revokeObjectURL(url);
    console.error('无法打开打印窗口，请检查浏览器弹窗拦截设置');
    return;
  }

  // 等待样式加载完成后打印
  let printed = false;
  printWindow.onload = () => {
    if (!printed) {
      printed = true;
      printWindow.print();
    }
  };
  // 部分浏览器 onload 不触发，使用延迟回退
  setTimeout(() => {
    if (!printed) {
      printed = true;
      printWindow.print();
    }
  }, 500);

  // 打印完成后释放 Blob URL（浏览器标签页关闭后也会自动回收）
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60000);
}

/**
 * 示例 Markdown 文本（用于占位提示）
 */
export const SAMPLE_MARKDOWN = `# 欢迎使用 Markdown 转 HTML

这是一个 **Markdown** 编辑器，支持实时预览。

## 基础语法

### 标题
使用 \`#\` 符号表示不同级别的标题。

### 列表
- 无序列表项 1
- 无序列表项 2
  - 嵌套列表项

1. 有序列表项 1
2. 有序列表项 2

### 文本样式
- **粗体文本**
- *斜体文本*
- ~~删除线文本~~
- \`行内代码\`

### 链接与图片
[访问 GitHub](https://github.com)

### 代码块
\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\`\`\`

## 扩展语法

### 表格
| 名称 | 类型 | 描述 |
|------|------|------|
| name | string | 用户名 |
| age | number | 年龄 |

### 任务列表
- [x] 已完成任务
- [ ] 待办任务

### 引用
> 这是一段引用文本。
> 可以有多行。

### 分割线

---

*开始编辑你的 Markdown 内容吧！*`;
