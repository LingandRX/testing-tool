import { FormMapEntry } from '@/types/storage';

/**
 * 模糊匹配引擎结果接口
 */
export interface MatchResult {
  element: HTMLElement | null;
  score: number;
}

/**
 * 注入结果接口
 */
export interface InjectResult {
  success: boolean;
  entry: FormMapEntry;
  error?: string;
}

/**
 * 模糊匹配引擎
 * 根据 JSON 指纹在页面中精准定位目标 DOM 元素
 */
export class FuzzyMatcher {
  private static readonly MATCH_THRESHOLD = 75;
  private static readonly SCORE_SELECTOR = 50;
  private static readonly SCORE_NAME_ATTR = 25;
  private static readonly SCORE_PLACEHOLDER = 15;
  private static readonly SCORE_NEIGHBOR_TEXT = 10;

  /**
   * 根据指纹查找目标元素
   * @param fingerprint - 表单字段指纹
   * @returns 匹配结果（包含元素和得分）
   */
  public static findTargetElement(fingerprint: FormMapEntry['fingerprint']): MatchResult {
    const candidates: Array<{ element: HTMLElement; score: number }> = [];

    // 1. 首先尝试精确选择器匹配
    if (fingerprint.selector) {
      const exactMatch = document.querySelector<HTMLElement>(fingerprint.selector);
      if (exactMatch) {
        const score = this.calculateScore(exactMatch, fingerprint);
        candidates.push({ element: exactMatch, score });
      }
    }

    // 2. 收集所有可能的候选元素
    const potentialElements = this.collectPotentialElements(fingerprint);
    for (const element of potentialElements) {
      const score = this.calculateScore(element, fingerprint);
      if (score > 0) {
        candidates.push({ element, score });
      }
    }

    // 3. 找到最高分的候选
    if (candidates.length === 0) {
      return { element: null, score: 0 };
    }

    const bestMatch = candidates.reduce((prev, curr) => (curr.score > prev.score ? curr : prev));

    return bestMatch.score >= this.MATCH_THRESHOLD
      ? { element: bestMatch.element, score: bestMatch.score }
      : { element: null, score: bestMatch.score };
  }

  /**
   * 计算元素匹配得分
   */
  private static calculateScore(
    element: HTMLElement,
    fingerprint: FormMapEntry['fingerprint'],
  ): number {
    let score = 0;

    // 选择器精确匹配
    if (fingerprint.selector) {
      const matched = document.querySelector(fingerprint.selector);
      if (matched === element) {
        score += this.SCORE_SELECTOR;
      }
    }

    // name 或 id 属性匹配
    if (fingerprint.name_attr) {
      const elementName = element.getAttribute('name') || '';
      const elementId = element.getAttribute('id') || '';
      if (elementName === fingerprint.name_attr || elementId === fingerprint.name_attr) {
        score += this.SCORE_NAME_ATTR;
      }
    }

    // placeholder 匹配
    if (fingerprint.placeholder) {
      const elementPlaceholder =
        'placeholder' in element && (element as HTMLInputElement).placeholder;
      if (elementPlaceholder === fingerprint.placeholder) {
        score += this.SCORE_PLACEHOLDER;
      }
    }

    // 邻近文本（label）匹配
    if (fingerprint.name_attr || fingerprint.placeholder) {
      const neighborText = this.getNeighborText(element);
      const searchText = fingerprint.name_attr || fingerprint.placeholder || '';
      if (neighborText.includes(searchText)) {
        score += this.SCORE_NEIGHBOR_TEXT;
      }
    }

    return score;
  }

  /**
   * 收集潜在的候选元素
   */
  private static collectPotentialElements(
    _fingerprint: FormMapEntry['fingerprint'],
  ): HTMLElement[] {
    const elements: HTMLElement[] = [];

    // 获取所有表单元素
    const selectors = [
      'input:not([type="hidden"])',
      'textarea',
      'select',
      '[contenteditable="true"]',
    ];

    for (const selector of selectors) {
      const found = document.querySelectorAll<HTMLElement>(selector);
      found.forEach((el) => {
        if (this.isVisibleElement(el)) {
          elements.push(el);
        }
      });
    }

    return elements;
  }

  /**
   * 获取元素附近的文本内容
   */
  private static getNeighborText(element: HTMLElement): string {
    const texts: string[] = [];

    // 查找关联的 label
    const id = element.getAttribute('id');
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) {
        texts.push(label.textContent || '');
      }
    }

    // 查找父级 label
    const parentLabel = element.closest('label');
    if (parentLabel) {
      texts.push(parentLabel.textContent || '');
    }

    // 查找相邻元素的文本
    const prevSibling = element.previousElementSibling;
    const nextSibling = element.nextElementSibling;
    if (prevSibling) {
      texts.push(prevSibling.textContent || '');
    }
    if (nextSibling) {
      texts.push(nextSibling.textContent || '');
    }

    // 查找父级内的文本节点
    const parent = element.parentElement;
    if (parent) {
      const textNodes = parent.querySelectorAll('span, div, p');
      textNodes.forEach((node) => {
        texts.push(node.textContent || '');
      });
    }

    return texts.join(' ').toLowerCase();
  }

  /**
   * 检查元素是否可见
   */
  private static isVisibleElement(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;

    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }
}

/**
 * 智能注入引擎
 * 突破 React/Vue 等现代框架的表单状态绑定
 */
export class SmartInjectionEngine {
  /**
   * 注入数据到目标元素
   * @param element - 目标 DOM 元素
   * @param entry - 表单映射条目
   * @returns 注入结果
   */
  public static inject(element: HTMLElement, entry: FormMapEntry, mockValue: string): InjectResult {
    try {
      const { action_logic } = entry;

      switch (action_logic.type) {
        case 'text':
          this.injectText(element as HTMLInputElement | HTMLTextAreaElement, mockValue);
          break;

        case 'select':
          this.injectSelect(element as HTMLSelectElement, action_logic);
          break;

        case 'checkbox':
          this.injectCheckbox(element as HTMLInputElement, action_logic);
          break;

        default:
          this.injectText(element as HTMLInputElement | HTMLTextAreaElement, mockValue);
      }

      return { success: true, entry };
    } catch (error) {
      return {
        success: false,
        entry,
        error: error instanceof Error ? error.message : '注入失败',
      };
    }
  }

  /**
   * 注入文本类输入框
   */
  private static injectText(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
    // 获取原生 setter
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      element instanceof HTMLInputElement
        ? window.HTMLInputElement.prototype
        : window.HTMLTextAreaElement.prototype,
      'value',
    )?.set;

    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(element, value);
    } else {
      element.value = value;
    }

    // 连续触发事件
    element.dispatchEvent(new Event('focus', { bubbles: true }));
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  /**
   * 注入下拉框
   */
  private static injectSelect(
    element: HTMLSelectElement,
    actionLogic: FormMapEntry['action_logic'],
  ): void {
    if (actionLogic.strategy === 'random') {
      // 随机选择
      const options = Array.from(element.options).filter((opt) => !opt.disabled);
      if (options.length > 0) {
        const randomIndex = Math.floor(Math.random() * options.length);
        element.selectedIndex = randomIndex;
      }
    } else {
      // 使用固定值
      const value = actionLogic.value;
      const matchingOption = Array.from(element.options).find(
        (opt) => opt.value === value || opt.text === value,
      );
      if (matchingOption) {
        element.value = matchingOption.value;
      } else if (element.options.length > 0) {
        element.selectedIndex = 0;
      }
    }

    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * 注入复选框/单选框
   */
  private static injectCheckbox(
    element: HTMLInputElement,
    actionLogic: FormMapEntry['action_logic'],
  ): void {
    if (actionLogic.strategy === 'random') {
      // 随机选择
      const isChecked = Math.random() > 0.5;
      if (element.type === 'checkbox') {
        element.checked = isChecked;
      } else if (element.type === 'radio') {
        // 对于单选框，找到同 name 的所有选项并随机选择一个
        const radioGroup = document.querySelectorAll<HTMLInputElement>(
          `input[type="radio"][name="${element.name}"]`,
        );
        if (radioGroup.length > 0) {
          const randomIndex = Math.floor(Math.random() * radioGroup.length);
          radioGroup[randomIndex].click();
        }
      }
    } else {
      // 使用固定值
      const shouldCheck = actionLogic.value === 'true' || actionLogic.value === '1';
      element.checked = shouldCheck;
      if (shouldCheck) {
        element.click();
      }
    }

    element.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

/**
 * Mock 数据生成器
 */
export class MockDataGenerator {
  /**
   * 根据策略生成随机数据
   */
  public static generate(actionLogic: FormMapEntry['action_logic'], entry: FormMapEntry): string {
    const { strategy, value, type } = actionLogic;

    if (strategy === 'fixed') {
      return value;
    }

    // 根据字段类型和策略生成数据
    switch (type) {
      case 'text':
        return this.generateText(entry);

      case 'select':
        return this.generateSelectValue();

      case 'checkbox':
        return this.generateBoolean();

      default:
        return this.generateText(entry);
    }
  }

  /**
   * 生成文本数据
   */
  private static generateText(entry: FormMapEntry): string {
    const { fingerprint, action_logic } = entry;
    const { strategy, value: pattern } = action_logic;

    // 根据模式生成数据
    if (pattern) {
      return this.generateByPattern(pattern);
    }

    // 根据指纹特征推断数据类型
    const name = fingerprint.name_attr.toLowerCase();
    const placeholder = fingerprint.placeholder.toLowerCase();

    if (name.includes('phone') || placeholder.includes('phone')) {
      return this.generatePhoneNumber();
    }
    if (name.includes('email') || placeholder.includes('email')) {
      return this.generateEmail();
    }
    if (name.includes('name') || placeholder.includes('name')) {
      return this.generateName();
    }
    if (name.includes('id') || name.includes('card')) {
      return this.generateIdCard();
    }
    if (name.includes('date') || placeholder.includes('date')) {
      return this.generateDate();
    }
    if (name.includes('number') || placeholder.includes('number')) {
      return this.generateNumber();
    }

    // 默认生成随机文本
    return strategy === 'random' ? this.generateRandomText() : '测试数据';
  }

  /**
   * 根据模式生成数据
   */
  private static generateByPattern(pattern: string): string {
    if (pattern.includes('phone') || pattern.includes('mobile')) {
      return this.generatePhoneNumber();
    }
    if (pattern.includes('email')) {
      return this.generateEmail();
    }
    if (pattern.includes('name')) {
      return this.generateName();
    }
    if (pattern.includes('date')) {
      return this.generateDate();
    }
    if (pattern.includes('idcard') || pattern.includes('身份证')) {
      return this.generateIdCard();
    }
    if (/^\d+$/.test(pattern)) {
      return this.generateNumber(pattern.length);
    }

    return pattern;
  }

  /**
   * 生成手机号
   */
  private static generatePhoneNumber(): string {
    const prefix = '1' + ['3', '4', '5', '6', '7', '8', '9'][Math.floor(Math.random() * 7)];
    const suffix = Math.floor(Math.random() * 1000000000)
      .toString()
      .padStart(9, '0');
    return prefix + suffix;
  }

  /**
   * 生成邮箱
   */
  private static generateEmail(): string {
    const names = ['test', 'user', 'admin', 'guest', 'demo'];
    const domains = ['example.com', 'test.com', 'gmail.com', 'outlook.com'];
    const name = names[Math.floor(Math.random() * names.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const num = Math.floor(Math.random() * 1000);
    return `${name}${num}@${domain}`;
  }

  /**
   * 生成姓名
   */
  private static generateName(): string {
    const surnames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄'];
    const givenNames = ['伟', '芳', '强', '英', '华', '建', '明', '娜'];
    return (
      surnames[Math.floor(Math.random() * surnames.length)] +
      givenNames[Math.floor(Math.random() * givenNames.length)]
    );
  }

  /**
   * 生成身份证号
   */
  private static generateIdCard(): string {
    const areaCodes = ['110101', '310101', '440101', '120101', '320101'];
    const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
    const year = (1980 + Math.floor(Math.random() * 30)).toString();
    const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
    const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return areaCode + year + month + day + random;
  }

  /**
   * 生成日期
   */
  private static generateDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 365));
    return date.toISOString().split('T')[0];
  }

  /**
   * 生成数字
   */
  private static generateNumber(length: number = 6): string {
    return Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0');
  }

  /**
   * 生成随机文本
   */
  private static generateRandomText(): string {
    const texts = ['测试内容', '示例文本', 'Lorem ipsum', '随机数据', 'Sample Text'];
    return texts[Math.floor(Math.random() * texts.length)];
  }

  /**
   * 生成下拉框值
   */
  private static generateSelectValue(): string {
    return '选项' + (Math.floor(Math.random() * 5) + 1);
  }

  /**
   * 生成布尔值
   */
  private static generateBoolean(): string {
    return Math.random() > 0.5 ? 'true' : 'false';
  }
}

/**
 * 视觉反馈渲染器
 */
export class FeedbackRenderer {
  private static readonly SUCCESS_COLOR = '#32CD32';
  private static readonly ERROR_COLOR = '#FF4444';
  private static readonly HIGHLIGHT_DURATION = 3000;

  /**
   * 渲染成功反馈
   */
  public static renderSuccess(element: HTMLElement): void {
    this.applyHighlight(element, this.SUCCESS_COLOR);
  }

  /**
   * 渲染失败反馈
   */
  public static renderError(element: HTMLElement | null): void {
    if (!element) return;
    this.applyHighlight(element, this.ERROR_COLOR);
  }

  /**
   * 应用高亮样式
   */
  private static applyHighlight(element: HTMLElement, color: string): void {
    // 保存原始样式
    const originalStyle = element.getAttribute('style') || '';
    element.setAttribute('data-original-style', originalStyle);

    // 应用高亮
    element.style.outline = `3px solid ${color}`;
    element.style.outlineOffset = '2px';
    element.style.transition = 'outline 0.3s ease';

    // 自动移除高亮
    setTimeout(() => {
      const savedStyle = element.getAttribute('data-original-style');
      if (savedStyle) {
        element.setAttribute('style', savedStyle);
        element.removeAttribute('data-original-style');
      } else {
        element.style.outline = '';
        element.style.outlineOffset = '';
      }
    }, this.HIGHLIGHT_DURATION);
  }

  /**
   * 清除所有高亮
   */
  public static clearAllHighlights(): void {
    const highlightedElements = document.querySelectorAll('[data-original-style]');
    highlightedElements.forEach((element) => {
      const savedStyle = element.getAttribute('data-original-style');
      if (savedStyle) {
        element.setAttribute('style', savedStyle);
        element.removeAttribute('data-original-style');
      }
    });
  }
}
