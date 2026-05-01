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
    const target = this.findRealTarget(element);

    return {
      selector: this.getUniqueSelector(target),
      name_attr: target.getAttribute('name') || target.getAttribute('id') || '',
      placeholder: target.getAttribute('placeholder') || '',
    };
  }

  /**
   * 寻找真实的表单目标元素（处理容器点击和 Label 点击）
   */
  public static findRealTarget(el: HTMLElement): HTMLElement {
    const formTags = ['INPUT', 'TEXTAREA', 'SELECT'];
    if (formTags.includes(el.tagName)) return el;

    // 1. 尝试寻找内部的表单元素
    const inner = el.querySelector<HTMLElement>(
      'input:not([type="hidden"]), textarea, select, [contenteditable="true"]',
    );
    if (inner) return inner;

    // 2. 尝试寻找关联的元素（如果点击的是 label）
    const label = el.closest('label');
    if (label) {
      const forId = label.getAttribute('for');
      if (forId) {
        const associated = document.getElementById(forId);
        if (associated) return associated;
      }
      // 如果没有 for，尝试找 label 内部的 input
      const innerInput = label.querySelector<HTMLElement>('input, textarea, select');
      if (innerInput) return innerInput;
    }

    return el;
  }

  /**
   * 提取元素的语义标签 (核心算法)
   * 优先查找 ARIA 标签，其次 label[for]，最后是物理位置探测
   */
  public static extractSemanticLabel(element: HTMLElement): string {
    // 1. 尝试查找 ARIA 标签
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();

    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const labelEl = document.getElementById(ariaLabelledBy);
      if (labelEl?.textContent && labelEl.textContent.trim()) return labelEl.textContent.trim();
    }

    // 2. 尝试查找 title 属性
    const title = element.getAttribute('title');
    if (title && title.trim()) return title.trim();

    // 3. 尝试查找关联的 label 元素
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label?.textContent && label.textContent.trim()) return label.textContent.trim();
    }

    // 4. 尝试向上查找父级中的 label
    const parentLabel = element.closest('label');
    if (parentLabel?.textContent && parentLabel.textContent.trim())
      return parentLabel.textContent.trim();

    // 5. 物理位置探测算法 (getBoundingClientRect)
    const rect = element.getBoundingClientRect();

    // 探测左侧 120px (适当增大范围)
    const leftText = this.getTextNearby(rect.left - 60, rect.top + rect.height / 2, element);
    if (leftText) return leftText;

    // 探测上方 60px
    const topText = this.getTextNearby(rect.left + rect.width / 2, rect.top - 30, element);
    if (topText) return topText;

    // 6. 降级：使用 placeholder 或 name
    const placeholder = element.getAttribute('placeholder');
    if (placeholder && placeholder.trim()) return placeholder.trim();

    const name = element.getAttribute('name');
    if (name && name.trim()) return name.trim();

    return '未命名组件';
  }

  /**
   * 在指定坐标附近寻找最可能的文本节点
   */
  private static getTextNearby(x: number, y: number, excludeElement: HTMLElement): string | null {
    if (x < 0 || y < 0) return null;
    const el = document.elementFromPoint(x, y);
    if (!el || el === excludeElement || el.contains(excludeElement)) return null;

    // 过滤掉输入框、下拉框等
    if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(el.tagName)) return null;

    const text = el.textContent?.trim();
    if (text && text.length > 0 && text.length < 50) {
      const cleaned = text.replace(/[:：*]\s*$/, '').trim();
      return cleaned || null;
    }

    return null;
  }

  private static MAX_RECURSION_DEPTH = 5;

  /**
   * 计算元素的相对短且唯一的 CSS 选择器
   */
  private static getUniqueSelector(el: HTMLElement, depth: number = 0): string {
    // 1. 优先使用稳定且具有语义的 ID (排除看起来是动态生成的 ID)
    if (el.id && !/^\d+|^[a-z0-9]{8,}$/i.test(el.id)) {
      return `#${el.id}`;
    }

    // 2. 尝试使用常用的测试属性和业务属性
    const testAttrs = ['data-testid', 'data-qa', 'data-cy', 'name', 'placeholder', 'type'];
    for (const attr of testAttrs) {
      const val = el.getAttribute(attr);
      if (val && val.trim()) {
        const selector = `${el.tagName.toLowerCase()}[${attr}="${val}"]`;
        try {
          if (document.querySelectorAll(selector).length === 1) {
            return selector;
          }
        } catch {
          // 忽略
        }
      }
    }

    // 3. 构建基于类名或 Tag 的选择器
    let path = el.tagName.toLowerCase();
    if (el.classList.length > 0) {
      const validClasses = Array.from(el.classList).filter((c) => !/^[a-z0-9_-]{8,}$/i.test(c));
      if (validClasses.length > 0) {
        path += `.${validClasses.join('.')}`;
      }
    }

    // 如果当前路径在全局已经是唯一的，直接返回
    try {
      if (document.querySelectorAll(path).length === 1) {
        return path;
      }
    } catch {
      // 忽略
    }

    // 4. 向上递归构建路径直到唯一
    const parent = el.parentElement;
    if (parent && parent.tagName.toLowerCase() !== 'html' && depth < this.MAX_RECURSION_DEPTH) {
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(el) + 1;

      // 尝试构建父级前缀
      const parentSelector = this.getUniqueSelector(parent as HTMLElement, depth + 1);
      const combinedSelector = `${parentSelector} > ${el.tagName.toLowerCase()}:nth-child(${index})`;

      return combinedSelector;
    }

    // 最后的兜底：全局 nth-of-type
    const allOfSameTag = Array.from(document.querySelectorAll(el.tagName));
    const index = allOfSameTag.indexOf(el) + 1;
    return `${el.tagName.toLowerCase()}:nth-of-type(${index})`;
  }
}
