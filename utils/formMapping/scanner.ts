import { FormMapEntry } from '@/types/storage';

/**
 * 智能探测引擎：负责扫描 DOM 并生成唯一指纹
 */
export class SmartDetector {
  /**
   * 扫描页面中符合条件的表单元素
   */
  public static scanFormElements(): HTMLElement[] {
    const selector =
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select, [contenteditable="true"]';
    const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
    return elements.filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none';
    });
  }

  /**
   * 生成元素的唯一性指纹
   */
  public static generateFingerprint(element: HTMLElement): FormMapEntry['fingerprint'] {
    return {
      selector: this.getUniqueSelector(element),
      name_attr: element.getAttribute('name') || element.getAttribute('id') || '',
      placeholder: element.getAttribute('placeholder') || '',
    };
  }

  /**
   * 提取元素的语义标签 (核心算法)
   * 优先查找 label[for]，其次在物理位置上方或左侧 50px 范围内寻找文本
   */
  public static extractSemanticLabel(element: HTMLElement): string {
    // 1. 尝试查找关联的 label 元素
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label?.textContent) return label.textContent.trim();
    }

    // 2. 尝试向上查找父级中的 label
    const parentLabel = element.closest('label');
    if (parentLabel?.textContent) return parentLabel.textContent.trim();

    // 3. 物理位置探测算法 (getBoundingClientRect)
    const rect = element.getBoundingClientRect();

    // 探测左侧 50px
    const leftText = this.getTextNearby(rect.left - 25, rect.top + rect.height / 2);
    if (leftText) return leftText;

    // 探测上方 50px
    const topText = this.getTextNearby(rect.left + rect.width / 2, rect.top - 25);
    if (topText) return topText;

    // 4. 降级：使用 placeholder 或 name
    return element.getAttribute('placeholder') || element.getAttribute('name') || '未知字段';
  }

  /**
   * 在指定坐标附近寻找最可能的文本节点
   */
  private static getTextNearby(x: number, y: number): string | null {
    if (x < 0 || y < 0) return null;
    const el = document.elementFromPoint(x, y);
    if (!el) return null;

    // 如果命中了文本容器
    const text = el.textContent?.trim();
    if (text && text.length < 30) return text; // 避免抓到太长的段落

    return null;
  }

  /**
   * 计算元素的相对短且唯一的 CSS 选择器
   */
  private static getUniqueSelector(el: HTMLElement): string {
    if (el.id) return `#${el.id}`;

    let path = el.tagName.toLowerCase();

    // 尝试添加类名以增加唯一性
    if (el.classList.length > 0) {
      path += `.${Array.from(el.classList).join('.')}`;
    }

    // 如果当前路径在文档中不是唯一的，则增加 nth-child
    if (document.querySelectorAll(path).length > 1) {
      const parent = el.parentElement;
      if (parent) {
        const index = Array.from(parent.children).indexOf(el) + 1;
        path = `${this.getUniqueSelector(parent as HTMLElement)} > ${el.tagName.toLowerCase()}:nth-child(${index})`;
      }
    }

    return path;
  }
}
