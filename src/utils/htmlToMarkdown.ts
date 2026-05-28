/**
 * HTML 转 Markdown 转换器工具函数
 *
 * 基于 DOM 解析实现，支持常见 HTML 标签到 Markdown 的转换。
 */

/**
 * HTML 转 Markdown 转换结果
 */
export interface HtmlToMarkdownResult {
  /** 转换后的 Markdown 字符串 */
  markdown: string;
  /** 原始 HTML 文本长度 */
  originalLength: number;
  /** 生成的 Markdown 长度 */
  markdownLength: number;
  /** 是否包含错误 */
  hasError: boolean;
  /** 错误信息（如果有） */
  error?: string;
}

/**
 * 将 HTML 文本转换为 Markdown
 *
 * @param html - HTML 源文本
 * @returns HtmlToMarkdownResult 转换结果
 */
export function htmlToMarkdown(html: string): HtmlToMarkdownResult {
  try {
    const trimmed = html.trim();
    if (!trimmed) {
      return {
        markdown: '',
        originalLength: 0,
        markdownLength: 0,
        hasError: false,
      };
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(trimmed, 'text/html');

    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      return {
        markdown: '',
        originalLength: html.length,
        markdownLength: 0,
        hasError: true,
        error: 'HTML 解析失败：无效的 HTML 结构',
      };
    }

    const markdown = convertNode(doc.body).trim();

    return {
      markdown,
      originalLength: html.length,
      markdownLength: markdown.length,
      hasError: false,
    };
  } catch (error) {
    return {
      markdown: '',
      originalLength: html.length,
      markdownLength: 0,
      hasError: true,
      error: error instanceof Error ? error.message : 'HTML 转换失败',
    };
  }
}

/**
 * 递归转换 DOM 节点为 Markdown
 */
function convertNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeMarkdownChars(node.textContent ?? '');
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const element = node as HTMLElement;
  const tagName = element.tagName.toLowerCase();
  const children = Array.from(element.childNodes);
  const inner = children.map(convertNode).join('');

  switch (tagName) {
    case 'h1':
      return `\n# ${inner.trim()}\n\n`;
    case 'h2':
      return `\n## ${inner.trim()}\n\n`;
    case 'h3':
      return `\n### ${inner.trim()}\n\n`;
    case 'h4':
      return `\n#### ${inner.trim()}\n\n`;
    case 'h5':
      return `\n##### ${inner.trim()}\n\n`;
    case 'h6':
      return `\n###### ${inner.trim()}\n\n`;
    case 'p':
      return `\n${inner.trim()}\n\n`;
    case 'br':
      return '\n';
    case 'hr':
      return '\n---\n\n';
    case 'strong':
    case 'b':
      return `**${inner.trim()}**`;
    case 'em':
    case 'i':
      return `*${inner.trim()}*`;
    case 'del':
    case 's':
    case 'strike':
      return `~~${inner.trim()}~~`;
    case 'code':
      return `\`${inner.trim()}\``;
    case 'pre': {
      const code = element.querySelector('code');
      if (code) {
        const lang = code.getAttribute('class')?.replace(/^language-/, '') ?? '';
        return `\n\`\`\`${lang}\n${code.textContent?.trim() ?? ''}\n\`\`\`\n\n`;
      }
      return `\n\`\`\`\n${inner.trim()}\n\`\`\`\n\n`;
    }
    case 'a': {
      const href = element.getAttribute('href') ?? '';
      const title = element.getAttribute('title');
      const text = inner.trim();
      if (!text) return '';
      if (title) {
        return `[${text}](${href} "${title}")`;
      }
      return `[${text}](${href})`;
    }
    case 'img': {
      const src = element.getAttribute('src') ?? '';
      const alt = element.getAttribute('alt') ?? '';
      const imgTitle = element.getAttribute('title');
      if (imgTitle) {
        return `![${alt}](${src} "${imgTitle}")`;
      }
      return `![${alt}](${src})`;
    }
    case 'blockquote':
      return `\n${inner
        .trim()
        .split('\n')
        .map((line) => (line.trim() ? `> ${line}` : line))
        .join('\n')}\n\n`;
    case 'ul': {
      const items = children
        .filter((child) => (child as HTMLElement).tagName?.toLowerCase() === 'li')
        .map((li) => {
          const liElement = li as HTMLElement;
          const task = liElement.querySelector('input[type="checkbox"]');
          const liText = convertNode(li).trim();
          if (task) {
            const checked = (task as HTMLInputElement).checked;
            return `- [${checked ? 'x' : ' '}] ${liText.replace(/^\[?[ x]\]?\s*/, '')}`;
          }
          return `- ${liText}`;
        })
        .join('\n');
      return `\n${items}\n\n`;
    }
    case 'ol': {
      let index = 1;
      const start = element.getAttribute('start');
      if (start) {
        const parsed = parseInt(start, 10);
        if (!isNaN(parsed)) index = parsed;
      }
      const items = children
        .filter((child) => (child as HTMLElement).tagName?.toLowerCase() === 'li')
        .map((li) => {
          const liElement = li as HTMLElement;
          const task = liElement.querySelector('input[type="checkbox"]');
          const liText = convertNode(li).trim();
          if (task) {
            const checked = (task as HTMLInputElement).checked;
            return `${index++}. [${checked ? 'x' : ' '}] ${liText.replace(/^\[?[ x]\]?\s*/, '')}`;
          }
          return `${index++}. ${liText}`;
        })
        .join('\n');
      return `\n${items}\n\n`;
    }
    case 'li': {
      // li 内容由 ul/ol 处理，这里只返回内部文本
      return inner.trim();
    }
    case 'table': {
      return convertTable(element);
    }
    case 'div':
    case 'span':
    case 'section':
    case 'article':
    case 'main':
    case 'header':
    case 'footer':
    case 'aside':
      return inner;
    case 'script':
    case 'style':
    case 'noscript':
      return '';
    default:
      return inner;
  }
}

/**
 * 转换表格元素为 Markdown
 */
function convertTable(table: HTMLElement): string {
  const rows = Array.from(table.querySelectorAll('tr'));
  if (rows.length === 0) return '';

  const lines: string[] = [];

  const headerRow = rows[0];
  const headerCells = Array.from(headerRow.querySelectorAll('th, td'));
  const headers = headerCells.map((cell) => (cell.textContent ?? '').trim());
  lines.push('| ' + headers.join(' | ') + ' |');

  // 分隔行
  const aligns = headerCells.map((cell) => {
    const style = (cell as HTMLElement).style.textAlign;
    if (style === 'center') return ':---:';
    if (style === 'right') return '---:';
    return '---';
  });
  lines.push('| ' + aligns.join(' | ') + ' |');

  // 数据行（从第二行开始）
  for (let i = 1; i < rows.length; i++) {
    const cells = Array.from(rows[i].querySelectorAll('td, th'));
    const values = cells.map((cell) => (cell.textContent ?? '').trim());
    lines.push('| ' + values.join(' | ') + ' |');
  }

  return '\n' + lines.join('\n') + '\n\n';
}

/**
 * 转义 Markdown 特殊字符（在行内文本中）
 */
function escapeMarkdownChars(text: string): string {
  // 仅在特定上下文中需要转义，这里简单处理
  return text;
}

/**
 * 示例 HTML 文本（用于占位提示）
 */
export const SAMPLE_HTML = `<!DOCTYPE html>
<html>
<head><title>示例</title></head>
<body>
  <h1>欢迎使用 HTML 转 Markdown</h1>
  <p>这是一个 <strong>HTML</strong> 到 <em>Markdown</em> 转换器。</p>

  <h2>支持的标签</h2>
  <ul>
    <li>标题：h1-h6</li>
    <li>文本格式：strong、em、del、code</li>
    <li>链接和图像</li>
    <li>列表：ul、ol</li>
    <li>表格：table</li>
    <li>引用：blockquote</li>
  </ul>

  <h3>代码示例</h3>
  <pre><code class="language-javascript">function hello() {
  console.log('Hello, World!');
}</code></pre>

  <h3>表格示例</h3>
  <table>
    <tr><th>名称</th><th>类型</th></tr>
    <tr><td>name</td><td>string</td></tr>
    <tr><td>age</td><td>number</td></tr>
  </table>

  <blockquote>
    <p>这是一段引用文本。</p>
  </blockquote>

  <p>开始转换你的 HTML 内容吧！</p>
</body>
</html>`;

/**
 * 下载 Markdown 文件
 *
 * @param content - Markdown 内容
 * @param filename - 下载文件名
 */
export function downloadMarkdownFile(content: string, filename: string = 'export.md'): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
