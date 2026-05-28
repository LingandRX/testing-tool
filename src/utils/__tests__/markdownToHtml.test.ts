import { describe, it, expect, vi } from 'vitest';
import {
  markdownToHtml,
  wrapHtmlDocument,
  downloadHtmlFile,
  SAMPLE_MARKDOWN,
} from '@/utils/markdownToHtml';

describe('markdownToHtml', () => {
  it('应该转换基础 Markdown 标题', () => {
    const result = markdownToHtml('# Hello World');
    expect(result.hasError).toBe(false);
    expect(result.html).toContain('<h1');
    expect(result.html).toContain('Hello World');
    expect(result.originalLength).toBe(13);
    expect(result.htmlLength).toBeGreaterThan(0);
  });

  it('应该转换粗体和斜体', () => {
    const result = markdownToHtml('**bold** and *italic*');
    expect(result.hasError).toBe(false);
    expect(result.html).toContain('<strong>bold</strong>');
    expect(result.html).toContain('<em>italic</em>');
  });

  it('应该转换链接', () => {
    const result = markdownToHtml('[Google](https://google.com)');
    expect(result.hasError).toBe(false);
    expect(result.html).toContain('<a');
    expect(result.html).toContain('href="https://google.com"');
    expect(result.html).toContain('Google');
  });

  it('应该转换无序列表', () => {
    const result = markdownToHtml('- item 1\n- item 2');
    expect(result.hasError).toBe(false);
    expect(result.html).toContain('<ul>');
    expect(result.html).toContain('<li>item 1</li>');
  });

  it('应该转换有序列表', () => {
    const result = markdownToHtml('1. first\n2. second');
    expect(result.hasError).toBe(false);
    expect(result.html).toContain('<ol>');
    expect(result.html).toContain('<li>first</li>');
  });

  it('应该转换代码块', () => {
    const result = markdownToHtml('```js\nconst x = 1;\n```');
    expect(result.hasError).toBe(false);
    expect(result.html).toContain('<pre>');
    expect(result.html).toContain('<code');
    expect(result.html).toContain('const x = 1;');
  });

  it('应该转换行内代码', () => {
    const result = markdownToHtml('use `npm install` command');
    expect(result.hasError).toBe(false);
    expect(result.html).toContain('<code>npm install</code>');
  });

  it('应该转换引用块', () => {
    const result = markdownToHtml('> This is a quote');
    expect(result.hasError).toBe(false);
    expect(result.html).toContain('<blockquote>');
    expect(result.html).toContain('This is a quote');
  });

  it('应该转换表格', () => {
    const md = '| A | B |\n|---|---|\n| 1 | 2 |';
    const result = markdownToHtml(md);
    expect(result.hasError).toBe(false);
    expect(result.html).toContain('<table>');
    expect(result.html).toContain('<th>A</th>');
    expect(result.html).toContain('<td>1</td>');
  });

  it('应该转换任务列表', () => {
    const result = markdownToHtml('- [x] done\n- [ ] todo');
    expect(result.hasError).toBe(false);
    expect(result.html).toContain('<input');
    expect(result.html).toContain('checked');
  });

  it('应该转换删除线', () => {
    const result = markdownToHtml('~~deleted~~');
    expect(result.hasError).toBe(false);
    expect(result.html).toContain('<del>deleted</del>');
  });

  it('应该处理空字符串', () => {
    const result = markdownToHtml('');
    expect(result.hasError).toBe(false);
    expect(result.html).toBe('');
    expect(result.originalLength).toBe(0);
    expect(result.htmlLength).toBe(0);
  });

  it('应该处理空白字符串', () => {
    const result = markdownToHtml('   \n   ');
    expect(result.hasError).toBe(false);
    expect(result.html).toBe('');
  });

  it('应该处理中文内容', () => {
    const result = markdownToHtml('# 你好世界\n\n这是**中文**内容。');
    expect(result.hasError).toBe(false);
    expect(result.html).toContain('你好世界');
    expect(result.html).toContain('<strong>中文</strong>');
  });

  it('应该转换示例 Markdown', () => {
    const result = markdownToHtml(SAMPLE_MARKDOWN);
    expect(result.hasError).toBe(false);
    expect(result.html).toContain('<h1');
    expect(result.html).toContain('<h2');
    expect(result.html).toContain('<table>');
    expect(result.html).toContain('<code>');
    expect(result.originalLength).toBe(SAMPLE_MARKDOWN.length);
    expect(result.htmlLength).toBeGreaterThan(result.originalLength);
  });
});

describe('wrapHtmlDocument', () => {
  it('应该生成完整的 HTML 文档', () => {
    const doc = wrapHtmlDocument('<p>Hello</p>', 'Test Title');
    expect(doc).toContain('<!DOCTYPE html>');
    expect(doc).toContain('<html');
    expect(doc).toContain('<head>');
    expect(doc).toContain('<title>Test Title</title>');
    expect(doc).toContain('<body>');
    expect(doc).toContain('<p>Hello</p>');
    expect(doc).toContain('</html>');
  });

  it('应该转义标题中的特殊字符', () => {
    const doc = wrapHtmlDocument('<p>test</p>', 'Title <script>');
    expect(doc).toContain('Title &lt;script&gt;');
    expect(doc).not.toContain('<script>');
  });

  it('应该使用默认标题', () => {
    const doc = wrapHtmlDocument('<p>test</p>');
    expect(doc).toContain('<title>Markdown Export</title>');
  });
});

describe('downloadHtmlFile', () => {
  it('应该创建下载链接并触发下载', () => {
    const createObjectURLSpy = vi.fn(() => 'blob:test');
    const revokeObjectURLSpy = vi.fn();
    (globalThis as any).URL = {
      createObjectURL: createObjectURLSpy,
      revokeObjectURL: revokeObjectURLSpy,
    };

    const clickSpy = vi.fn();
    const mockAnchor = document.createElement('a');
    mockAnchor.click = clickSpy;

    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockReturnValue(mockAnchor);
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockReturnValue(mockAnchor);

    downloadHtmlFile('<p>test</p>', 'test.html');

    expect(clickSpy).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalled();

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });
});
