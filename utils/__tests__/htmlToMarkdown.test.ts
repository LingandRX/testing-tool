import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { htmlToMarkdown, downloadMarkdownFile, SAMPLE_HTML } from '../htmlToMarkdown';

describe('htmlToMarkdown', () => {
  it('returns empty result for empty string', () => {
    const result = htmlToMarkdown('');
    expect(result.markdown).toBe('');
    expect(result.originalLength).toBe(0);
    expect(result.markdownLength).toBe(0);
    expect(result.hasError).toBe(false);
  });

  it('returns empty result for whitespace-only string', () => {
    const result = htmlToMarkdown('   \n  ');
    expect(result.markdown).toBe('');
    expect(result.hasError).toBe(false);
  });

  it('converts h1 heading', () => {
    const result = htmlToMarkdown('<h1>Hello World</h1>');
    expect(result.markdown).toContain('# Hello World');
  });

  it('converts h2-h6 headings', () => {
    const result = htmlToMarkdown(
      '<h2>Two</h2><h3>Three</h3><h4>Four</h4><h5>Five</h5><h6>Six</h6>',
    );
    expect(result.markdown).toContain('## Two');
    expect(result.markdown).toContain('### Three');
    expect(result.markdown).toContain('#### Four');
    expect(result.markdown).toContain('##### Five');
    expect(result.markdown).toContain('###### Six');
  });

  it('converts paragraph', () => {
    const result = htmlToMarkdown('<p>This is a paragraph.</p>');
    expect(result.markdown).toContain('This is a paragraph.');
  });

  it('converts strong and b tags', () => {
    const result = htmlToMarkdown('<strong>bold</strong> and <b>also bold</b>');
    expect(result.markdown).toContain('**bold**');
    expect(result.markdown).toContain('**also bold**');
  });

  it('converts em and i tags', () => {
    const result = htmlToMarkdown('<em>italic</em> and <i>also italic</i>');
    expect(result.markdown).toContain('*italic*');
    expect(result.markdown).toContain('*also italic*');
  });

  it('converts del and s tags', () => {
    const result = htmlToMarkdown('<del>deleted</del> and <s>strikethrough</s>');
    expect(result.markdown).toContain('~~deleted~~');
    expect(result.markdown).toContain('~~strikethrough~~');
  });

  it('converts inline code', () => {
    const result = htmlToMarkdown('<code>const x = 1;</code>');
    expect(result.markdown).toContain('`const x = 1;`');
  });

  it('converts pre code block', () => {
    const result = htmlToMarkdown('<pre><code>line1\nline2</code></pre>');
    expect(result.markdown).toContain('```');
    expect(result.markdown).toContain('line1');
    expect(result.markdown).toContain('line2');
  });

  it('converts pre code block with language', () => {
    const result = htmlToMarkdown(
      '<pre><code class="language-javascript">const x = 1;</code></pre>',
    );
    expect(result.markdown).toContain('```javascript');
    expect(result.markdown).toContain('const x = 1;');
  });

  it('converts anchor links', () => {
    const result = htmlToMarkdown('<a href="https://example.com">Link text</a>');
    expect(result.markdown).toContain('[Link text](https://example.com)');
  });

  it('converts anchor links with title', () => {
    const result = htmlToMarkdown('<a href="https://example.com" title="Title">Link</a>');
    expect(result.markdown).toContain('[Link](https://example.com "Title")');
  });

  it('converts images', () => {
    const result = htmlToMarkdown('<img src="image.png" alt="desc" />');
    expect(result.markdown).toContain('![desc](image.png)');
  });

  it('converts images with title', () => {
    const result = htmlToMarkdown('<img src="image.png" alt="desc" title="Title" />');
    expect(result.markdown).toContain('![desc](image.png "Title")');
  });

  it('converts unordered list', () => {
    const result = htmlToMarkdown('<ul><li>Item 1</li><li>Item 2</li></ul>');
    expect(result.markdown).toContain('- Item 1');
    expect(result.markdown).toContain('- Item 2');
  });

  it('converts ordered list', () => {
    const result = htmlToMarkdown('<ol><li>First</li><li>Second</li></ol>');
    expect(result.markdown).toContain('1. First');
    expect(result.markdown).toContain('2. Second');
  });

  it('converts ordered list with start attribute', () => {
    const result = htmlToMarkdown('<ol start="5"><li>Item</li></ol>');
    expect(result.markdown).toContain('5. Item');
  });

  it('converts blockquote', () => {
    const result = htmlToMarkdown('<blockquote><p>Quote text</p></blockquote>');
    expect(result.markdown).toContain('> Quote text');
  });

  it('converts horizontal rule', () => {
    const result = htmlToMarkdown('<hr />');
    expect(result.markdown).toContain('---');
  });

  it('converts line break', () => {
    const result = htmlToMarkdown('Line 1<br />Line 2');
    expect(result.markdown).toContain('\n');
  });

  it('converts table', () => {
    const html =
      '<table><tr><th>Name</th><th>Type</th></tr><tr><td>John</td><td>User</td></tr></table>';
    const result = htmlToMarkdown(html);
    expect(result.markdown).toContain('| Name | Type |');
    expect(result.markdown).toContain('| --- | --- |');
    expect(result.markdown).toContain('| John | User |');
  });

  it('ignores script and style tags', () => {
    const result = htmlToMarkdown('<script>alert(1)</script><style>.x{}</style><p>text</p>');
    expect(result.markdown).not.toContain('alert');
    expect(result.markdown).not.toContain('.x{}');
    expect(result.markdown).toContain('text');
  });

  it('handles nested elements', () => {
    const result = htmlToMarkdown('<p><strong>bold</strong> and <em>italic</em></p>');
    expect(result.markdown).toContain('**bold**');
    expect(result.markdown).toContain('*italic*');
  });

  it('returns hasError false for valid HTML', () => {
    const result = htmlToMarkdown('<p>Valid</p>');
    expect(result.hasError).toBe(false);
    expect(result.error).toBeUndefined();
  });

  it('returns correct length stats', () => {
    const html = '<p>Hello</p>';
    const result = htmlToMarkdown(html);
    expect(result.originalLength).toBe(html.length);
    expect(result.markdownLength).toBe(result.markdown.length);
  });

  it('handles full HTML document', () => {
    const result = htmlToMarkdown(SAMPLE_HTML);
    expect(result.hasError).toBe(false);
    expect(result.markdown).toContain('# 欢迎使用 HTML 转 Markdown');
    expect(result.markdown).toContain('**HTML**');
    expect(result.markdown).toContain('*Markdown*');
    expect(result.markdown).toContain('```javascript');
    expect(result.markdown).toContain('| 名称 | 类型 |');
    expect(result.markdown).toContain('> 这是一段引用文本');
  });

  it('handles plain text without tags', () => {
    const result = htmlToMarkdown('Just plain text');
    expect(result.markdown).toContain('Just plain text');
    expect(result.hasError).toBe(false);
  });

  it('handles task list items', () => {
    const result = htmlToMarkdown(
      '<ul><li><input type="checkbox" checked /> Done</li><li><input type="checkbox" /> Todo</li></ul>',
    );
    expect(result.markdown).toContain('- [x] Done');
    expect(result.markdown).toContain('- [ ] Todo');
  });

  it('handles div and span wrappers', () => {
    const result = htmlToMarkdown('<div><span><p>Content</p></span></div>');
    expect(result.markdown).toContain('Content');
  });

  it('handles empty anchor with no text', () => {
    const result = htmlToMarkdown('<a href="https://example.com"></a>');
    expect(result.markdown).not.toContain('[');
  });

  it('handles unknown tags gracefully', () => {
    const result = htmlToMarkdown('<custom-tag>Content</custom-tag>');
    expect(result.markdown).toContain('Content');
  });
});

describe('downloadMarkdownFile', () => {
  const originalURL = globalThis.URL;
  let createObjectURLSpy: ReturnType<typeof vi.fn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.fn>;
  let clickSpy: ReturnType<typeof vi.fn>;
  let appendChildSpy: ReturnType<typeof vi.fn>;
  let removeChildSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    createObjectURLSpy = vi.fn().mockReturnValue('blob:test-url');
    revokeObjectURLSpy = vi.fn();
    (globalThis as any).URL = {
      createObjectURL: createObjectURLSpy,
      revokeObjectURL: revokeObjectURLSpy,
    };

    clickSpy = vi.fn();
    appendChildSpy = vi.fn();
    removeChildSpy = vi.fn();

    const mockLink = {
      href: '',
      download: '',
      click: clickSpy,
    };

    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    vi.spyOn(document.body, 'appendChild').mockImplementation(appendChildSpy as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(removeChildSpy as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    (globalThis as any).URL = originalURL;
  });

  it('should create a blob and trigger download', () => {
    downloadMarkdownFile('# Hello', 'test.md');

    expect(createObjectURLSpy).toHaveBeenCalledOnce();
    expect(clickSpy).toHaveBeenCalledOnce();
    expect(appendChildSpy).toHaveBeenCalledOnce();
    expect(removeChildSpy).toHaveBeenCalledOnce();
    expect(revokeObjectURLSpy).toHaveBeenCalledOnce();
  });

  it('should use default filename when not provided', () => {
    downloadMarkdownFile('content');

    const mockLink = (document.createElement as any).mock.results[0].value;
    expect(mockLink.download).toBe('export.md');
  });

  it('should set correct MIME type', () => {
    downloadMarkdownFile('content');

    const blobArg = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(blobArg.type).toBe('text/markdown;charset=utf-8');
  });
});
