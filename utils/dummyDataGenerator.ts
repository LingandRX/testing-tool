import { faker, fakerZH_CN } from '@faker-js/faker';

/**
 * 表单字段信息接口
 */
export interface FormFieldInfo {
  id: string;
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  fieldType: FieldType;
  label: string | null;
  placeholder: string;
  name: string;
  value: string;
  isSelected: boolean;
  generatedValue: string;
}

/**
 * 扫描结果接口
 */
export interface ScanResult {
  fields: FormFieldInfo[];
  totalCount: number;
  validCount: number;
  modalContainer: HTMLElement | null;
}

/**
 * 数据生成器工具类
 * 用于生成各种类型的测试数据
 */
export class DummyDataGenerator {
  /**
   * 生成随机中文姓名
   */
  static generateChineseName(): string {
    return fakerZH_CN.person.fullName();
  }

  /**
   * 生成随机英文姓名
   */
  static generateEnglishName(): string {
    return faker.person.fullName();
  }

  /**
   * 生成随机手机号
   */
  static generatePhoneNumber(): string {
    return fakerZH_CN.phone.number();
  }

  /**
   * 生成有效邮箱
   */
  static generateValidEmail(): string {
    return faker.internet.email();
  }

  /**
   * 生成无效邮箱
   */
  static generateInvalidEmail(): string {
    const invalidEmails = [
      'testexample.com', // 缺失 @
      'test@@example.com', // 多个 @
      'test@', // 缺失域名
      'test@.com', // 域名为空
      'test@example', // 缺失顶级域名
    ];

    return invalidEmails[Math.floor(Math.random() * invalidEmails.length)];
  }

  /**
   * 生成短文本
   */
  static generateShortText(): string {
    return faker.lorem.sentence({ min: 3, max: 6 });
  }

  /**
   * 生成长文本
   */
  static generateLongText(): string {
    return faker.lorem.paragraphs(5);
  }

  /**
   * 生成边界测试文本
   */
  static generateBoundaryText(): string {
    const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';
    const emoji = '😀😃😄😁😆😅😂🤣';
    let text = '';

    for (let i = 0; i < 100; i++) {
      text += specialChars + emoji + '测试文本';
    }

    return text;
  }

  /**
   * 生成随机数字
   */
  static generateNumber(): number {
    return faker.number.int(10000);
  }

  /**
   * 生成随机浮点数
   */
  static generateFloat(): number {
    return faker.number.float({ max: 10000 });
  }

  /**
   * 生成随机负数
   */
  static generateNegativeNumber(): number {
    return -faker.number.int(10000);
  }

  /**
   * 生成随机日期
   */
  static generateDate(): string {
    return faker.date.recent({ days: 365 }).toISOString().split('T')[0];
  }

  /**
   * 生成过去的日期
   */
  static generatePastDate(): string {
    return faker.date.past({ years: 1 }).toISOString().split('T')[0];
  }

  /**
   * 生成未来的日期
   */
  static generateFutureDate(): string {
    return faker.date.future({ years: 1 }).toISOString().split('T')[0];
  }

  /**
   * 生成随机身份证号
   */
  static generateIdCard(): string {
    const areaCodes = [
      '110101',
      '110102',
      '110103',
      '110104',
      '110105',
      '310101',
      '310102',
      '310103',
      '310104',
      '310105',
      '440101',
      '440102',
      '440103',
      '440104',
      '440105',
    ];
    const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
    const year = (1950 + Math.floor(Math.random() * 50)).toString();
    const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
    const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');

    return areaCode + year + month + day + random;
  }
}

/**
 * 表单字段类型
 */
export enum FieldType {
  TEXT = 'text',
  EMAIL = 'email',
  PHONE = 'phone',
  NUMBER = 'number',
  DATE = 'date',
  TEXTarea = 'textarea',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  SELECT = 'select',
  PASSWORD = 'password',
  NAME = 'name',
  ID_CARD = 'id_card',
  UNKNOWN = 'unknown',
}

/**
 * 填充模式
 */
export enum FillMode {
  VALID = 'valid',
  INVALID = 'invalid',
}

/**
 * 识别表单字段类型
 */
export function recognizeFieldType(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
): FieldType {
  // 基于 type 属性识别
  if (element instanceof HTMLInputElement) {
    switch (element.type) {
      case 'email':
        return FieldType.EMAIL;
      case 'tel':
        return FieldType.PHONE;
      case 'number':
        return FieldType.NUMBER;
      case 'date':
        return FieldType.DATE;
      case 'password':
        return FieldType.PASSWORD;
      case 'radio':
        return FieldType.RADIO;
      case 'checkbox':
        return FieldType.CHECKBOX;
      case 'text':
        break;
    }
  }

  // 基于 name 或 id 识别
  const name = (element.name || element.id || '').toLowerCase();
  if (name.includes('email') || name.includes('mail')) {
    return FieldType.EMAIL;
  }
  if (name.includes('phone') || name.includes('tel') || name.includes('mobile')) {
    return FieldType.PHONE;
  }
  if (name.includes('name') || name.includes('user') || name.includes('username')) {
    return FieldType.NAME;
  }
  if (name.includes('id') || name.includes('card') || name.includes('identity')) {
    return FieldType.ID_CARD;
  }
  if (name.includes('password') || name.includes('pass')) {
    return FieldType.PASSWORD;
  }
  if (name.includes('number') || name.includes('num')) {
    return FieldType.NUMBER;
  }
  if (name.includes('date') || name.includes('time')) {
    return FieldType.DATE;
  }

  // 基于 placeholder 识别
  if ('placeholder' in element) {
    const placeholder = (element.placeholder || '').toLowerCase();
    if (placeholder.includes('email') || placeholder.includes('mail')) {
      return FieldType.EMAIL;
    }
    if (
      placeholder.includes('phone') ||
      placeholder.includes('tel') ||
      placeholder.includes('mobile')
    ) {
      return FieldType.PHONE;
    }
    if (
      placeholder.includes('name') ||
      placeholder.includes('user') ||
      placeholder.includes('username')
    ) {
      return FieldType.NAME;
    }
    if (
      placeholder.includes('id') ||
      placeholder.includes('card') ||
      placeholder.includes('identity')
    ) {
      return FieldType.ID_CARD;
    }
    if (placeholder.includes('password') || placeholder.includes('pass')) {
      return FieldType.PASSWORD;
    }
    if (placeholder.includes('number') || placeholder.includes('num')) {
      return FieldType.NUMBER;
    }
    if (placeholder.includes('date') || placeholder.includes('time')) {
      return FieldType.DATE;
    }
  }

  // 基于标签识别
  const label = getFieldLabel(element);
  if (label) {
    const labelText = label.toLowerCase();
    if (labelText.includes('邮箱') || labelText.includes('email') || labelText.includes('mail')) {
      return FieldType.EMAIL;
    }
    if (
      labelText.includes('手机') ||
      labelText.includes('电话') ||
      labelText.includes('tel') ||
      labelText.includes('mobile')
    ) {
      return FieldType.PHONE;
    }
    if (
      labelText.includes('姓名') ||
      labelText.includes('名字') ||
      labelText.includes('name') ||
      labelText.includes('user') ||
      labelText.includes('username')
    ) {
      return FieldType.NAME;
    }
    if (
      labelText.includes('身份证') ||
      labelText.includes('id') ||
      labelText.includes('card') ||
      labelText.includes('identity')
    ) {
      return FieldType.ID_CARD;
    }
    if (labelText.includes('密码') || labelText.includes('pass')) {
      return FieldType.PASSWORD;
    }
    if (labelText.includes('数字') || labelText.includes('number') || labelText.includes('num')) {
      return FieldType.NUMBER;
    }
    if (
      labelText.includes('日期') ||
      labelText.includes('时间') ||
      labelText.includes('date') ||
      labelText.includes('time')
    ) {
      return FieldType.DATE;
    }
  }

  // 基于元素类型识别
  if (element instanceof HTMLTextAreaElement) {
    return FieldType.TEXTarea;
  }
  if (element instanceof HTMLSelectElement) {
    return FieldType.SELECT;
  }

  return FieldType.TEXT;
}

/**
 * 获取字段的标签
 */
function getFieldLabel(element: HTMLElement): string | null {
  // 查找相邻的 label 元素
  const labels = document.querySelectorAll('label');
  for (const label of labels) {
    const forAttr = label.getAttribute('for');
    if (forAttr === element.id) {
      return label.textContent || null;
    }
  }

  // 查找父元素中的 label
  let parent = element.parentElement;
  while (parent) {
    if (parent.tagName === 'LABEL') {
      return parent.textContent || null;
    }
    parent = parent.parentElement;
  }

  return null;
}

/**
 * 填充表单字段
 */
export function fillField(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  mode: FillMode,
): void {
  const fieldType = recognizeFieldType(element);
  let value: string | number | boolean = '';

  switch (fieldType) {
    case FieldType.NAME:
      value =
        Math.random() > 0.5
          ? DummyDataGenerator.generateChineseName()
          : DummyDataGenerator.generateEnglishName();
      break;
    case FieldType.EMAIL:
      value =
        mode === FillMode.VALID
          ? DummyDataGenerator.generateValidEmail()
          : DummyDataGenerator.generateInvalidEmail();
      break;
    case FieldType.PHONE:
      value = DummyDataGenerator.generatePhoneNumber();
      break;
    case FieldType.NUMBER:
      value =
        mode === FillMode.VALID
          ? DummyDataGenerator.generateNumber()
          : DummyDataGenerator.generateNegativeNumber();
      break;
    case FieldType.DATE:
      value = DummyDataGenerator.generateDate();
      break;
    case FieldType.TEXTarea:
      value =
        mode === FillMode.VALID
          ? DummyDataGenerator.generateLongText()
          : DummyDataGenerator.generateBoundaryText();
      break;
    case FieldType.PASSWORD:
      value = 'password123';
      break;
    case FieldType.ID_CARD:
      value = DummyDataGenerator.generateIdCard();
      break;
    case FieldType.TEXT:
    default:
      value =
        mode === FillMode.VALID
          ? DummyDataGenerator.generateShortText()
          : DummyDataGenerator.generateBoundaryText();
      break;
  }

  // 填充值
  if (element instanceof HTMLInputElement) {
    if (element.type === 'checkbox' || element.type === 'radio') {
      element.checked = Math.random() > 0.5;
    } else {
      element.value = String(value);
    }
  } else if (element instanceof HTMLTextAreaElement) {
    element.value = String(value);
  } else if (element instanceof HTMLSelectElement) {
    // 随机选择一个非禁用的选项
    const options = Array.from(element.options).filter((option) => !option.disabled);
    if (options.length > 0) {
      const randomIndex = Math.floor(Math.random() * options.length);
      element.selectedIndex = randomIndex;
    }
  }

  // 触发事件，确保前端框架能够监听到变化
  triggerEvents(element);
}

/**
 * 触发事件
 */
function triggerEvents(element: HTMLElement): void {
  // 触发 input 事件
  const inputEvent = new Event('input', {
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(inputEvent);

  // 触发 change 事件
  const changeEvent = new Event('change', {
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(changeEvent);

  // 触发 blur 事件
  const blurEvent = new Event('blur', {
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(blurEvent);
}

/**
 * 判断元素是否真正可见且允许输入
 */
function isElementVisible(element: HTMLElement): boolean {
  // 1. 排除隐藏域、禁用和只读状态
  if (element instanceof HTMLInputElement) {
    if (element.type === 'hidden' || element.disabled || element.readOnly) {
      return false;
    }
  } else if (element instanceof HTMLTextAreaElement) {
    if (element.disabled || element.readOnly) {
      return false;
    }
  } else if (element instanceof HTMLSelectElement) {
    if (element.disabled) {
      return false;
    }
  }

  // 2. 检查空间尺寸 (能有效过滤大部分 display: none 或未渲染完毕的组件)
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    return false;
  }

  // 3. 检查计算样式 (兜底检查 css 隐藏手段)
  const style = window.getComputedStyle(element);
  if (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.opacity === '0' ||
    style.visibility === 'collapse'
  ) {
    return false;
  }

  return true;
}

/**
 * Z轴穿透验证 (Raycasting)
 * 通过 document.elementFromPoint(x, y) 向元素中心点发射坐标射线
 * 如果获取到的顶层元素不是输入框本身或其子元素，则判定为"视觉遮挡"
 */
function isElementNotObscured(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();

  // 计算元素中心点坐标
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // 向元素中心点发射坐标射线，获取最顶层的元素
  const topElement = document.elementFromPoint(centerX, centerY);

  if (!topElement) {
    return false;
  }

  // 检查获取到的顶层元素是否是输入框本身或其子元素
  return element.contains(topElement);
}

/**
 * 判断元素是否在视口范围内
 */
function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * 判断元素是否真正可见且允许输入（漏斗式检测）
 */
function isElementValidForFill(element: HTMLElement): boolean {
  // 1. 基础过滤：排除隐藏域、禁用和只读状态
  if (element instanceof HTMLInputElement) {
    if (element.type === 'hidden' || element.disabled || element.readOnly) {
      return false;
    }
  } else if (element instanceof HTMLTextAreaElement) {
    if (element.disabled || element.readOnly) {
      return false;
    }
  } else if (element instanceof HTMLSelectElement) {
    if (element.disabled) {
      return false;
    }
  } else {
    return false;
  }

  // 2. 空间尺寸检测：排除宽高为0的元素
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    return false;
  }

  // 3. CSS样式检测：排除通过CSS隐藏的元素
  const style = window.getComputedStyle(element);
  if (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.opacity === '0' ||
    style.visibility === 'collapse'
  ) {
    return false;
  }

  // 4. 视口检测：只处理当前屏幕滚动范围内的元素
  if (!isElementInViewport(element)) {
    return false;
  }

  // 5. Z轴穿透验证（最后一步，最耗时，放最后）
  if (!isElementNotObscured(element)) {
    return false;
  }

  return true;
}

/**
 * 查找最上层的弹窗容器
 */
function findActiveModalContainer(): HTMLElement | null {
  const modalSelectors = [
    '.ant-modal-content',
    '.el-dialog',
    '[role="dialog"]',
    '.MuiDialog-content',
    '.modal-content',
    '.dialog-content',
    '.popup-content',
  ];

  let topModal: HTMLElement | null = null;
  let highestZIndex = 0;

  modalSelectors.forEach((selector) => {
    const modals = document.querySelectorAll(selector);
    modals.forEach((modal) => {
      if (modal instanceof HTMLElement) {
        const style = window.getComputedStyle(modal);
        const zIndex = parseInt(style.zIndex, 10) || 0;
        if (zIndex > highestZIndex && isElementVisible(modal)) {
          highestZIndex = zIndex;
          topModal = modal;
        }
      }
    });
  });

  return topModal;
}

/**
 * 扫描页面中所有可见的表单字段
 */
export function scanFormFields(): ScanResult {
  const inputs = document.querySelectorAll('input, textarea, select');
  const fields: FormFieldInfo[] = [];
  const modalContainer = findActiveModalContainer();

  inputs.forEach((input) => {
    if (
      input instanceof HTMLInputElement ||
      input instanceof HTMLTextAreaElement ||
      input instanceof HTMLSelectElement
    ) {
      if (isElementValidForFill(input)) {
        const fieldType = recognizeFieldType(input);
        const label = getFieldLabel(input);
        const placeholder = 'placeholder' in input ? input.placeholder : '';
        const name = input.name || input.id || '';

        fields.push({
          id: `field-${Math.random().toString(36).substr(2, 9)}`,
          element: input,
          fieldType,
          label,
          placeholder,
          name,
          value: input.value,
          isSelected: true,
          generatedValue: generateValueByFieldType(fieldType, FillMode.VALID),
        });
      }
    }
  });

  return {
    fields,
    totalCount: fields.length,
    validCount: fields.filter((f) => f.isSelected).length,
    modalContainer,
  };
}

/**
 * 根据字段类型生成对应的值
 */
export function generateValueByFieldType(fieldType: FieldType, mode: FillMode): string {
  switch (fieldType) {
    case FieldType.NAME:
      return Math.random() > 0.5
        ? DummyDataGenerator.generateChineseName()
        : DummyDataGenerator.generateEnglishName();
    case FieldType.EMAIL:
      return mode === FillMode.VALID
        ? DummyDataGenerator.generateValidEmail()
        : DummyDataGenerator.generateInvalidEmail();
    case FieldType.PHONE:
      return DummyDataGenerator.generatePhoneNumber();
    case FieldType.NUMBER:
      return String(
        mode === FillMode.VALID
          ? DummyDataGenerator.generateNumber()
          : DummyDataGenerator.generateNegativeNumber(),
      );
    case FieldType.DATE:
      return DummyDataGenerator.generateDate();
    case FieldType.TEXTarea:
      return mode === FillMode.VALID
        ? DummyDataGenerator.generateLongText()
        : DummyDataGenerator.generateBoundaryText();
    case FieldType.PASSWORD:
      return 'password123';
    case FieldType.ID_CARD:
      return DummyDataGenerator.generateIdCard();
    case FieldType.TEXT:
    default:
      return mode === FillMode.VALID
        ? DummyDataGenerator.generateShortText()
        : DummyDataGenerator.generateBoundaryText();
  }
}

/**
 * 框架级数据注入器
 * 破解 React/Vue 的 input setter 劫持
 */
function setInputValue(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: string,
): void {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    element instanceof HTMLInputElement
      ? window.HTMLInputElement.prototype
      : element instanceof HTMLTextAreaElement
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLSelectElement.prototype,
    'value',
  )?.set;

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(element, value);
  } else {
    element.value = value;
  }
}

/**
 * 填充指定字段（使用框架级注入）
 */
export function fillFieldWithInjector(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: string,
): void {
  if (element instanceof HTMLInputElement) {
    if (element.type === 'checkbox' || element.type === 'radio') {
      element.checked = value === 'true' || value === '1';
    } else {
      setInputValue(element, value);
    }
  } else if (element instanceof HTMLTextAreaElement) {
    setInputValue(element, value);
  } else if (element instanceof HTMLSelectElement) {
    // 查找匹配的选项
    const options = Array.from(element.options);
    const matchingOption = options.find((opt) => opt.value === value || opt.text === value);
    if (matchingOption) {
      element.value = matchingOption.value;
    } else if (options.length > 0) {
      element.selectedIndex = 0;
    }
  }

  triggerEvents(element);
}

/**
 * 批量填充选中的字段
 */
export function fillSelectedFields(fields: FormFieldInfo[], mode: FillMode): number {
  let filledCount = 0;

  fields.forEach((field) => {
    if (field.isSelected) {
      const value = field.generatedValue || generateValueByFieldType(field.fieldType, mode);
      fillFieldWithInjector(field.element, value);
      filledCount++;
    }
  });

  return filledCount;
}

/**
 * 高亮指定字段
 */
export function highlightField(element: HTMLElement): void {
  const originalStyle =
    element.getAttribute('data-original-style') || element.getAttribute('style') || '';
  element.setAttribute('data-original-style', originalStyle);

  element.style.outline = '3px solid #2196f3';
  element.style.outlineOffset = '2px';
  element.style.transition = 'outline 0.2s ease-in-out';
}

/**
 * 取消高亮指定字段
 */
export function unhighlightField(element: HTMLElement): void {
  const originalStyle = element.getAttribute('data-original-style') || '';
  if (originalStyle) {
    element.setAttribute('style', originalStyle);
    element.removeAttribute('data-original-style');
  } else {
    element.style.outline = '';
    element.style.outlineOffset = '';
  }
}

/**
 * 高亮所有指定字段
 */
export function highlightAllFields(fieldIds: string[], fields: FormFieldInfo[]): void {
  fieldIds.forEach((id) => {
    const field = fields.find((f) => f.id === id);
    if (field) {
      highlightField(field.element);
    }
  });
}

/**
 * 取消高亮所有字段
 */
export function unhighlightAllFields(fields: FormFieldInfo[]): void {
  fields.forEach((field) => {
    unhighlightField(field.element);
  });
}

/**
 * 填充所有表单字段
 */
export function fillAllFields(mode: FillMode, includeHidden: boolean = false): void {
  const inputs = document.querySelectorAll('input, textarea, select');

  inputs.forEach((element) => {
    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement
    ) {
      if (!isElementValidForFill(element)) {
        return;
      }

      if (!includeHidden) {
        if (element instanceof HTMLInputElement && element.type === 'hidden') {
          return;
        }
      }

      const fieldType = recognizeFieldType(element);
      const value = generateValueByFieldType(fieldType, mode);
      fillFieldWithInjector(element, value);
    }
  });
}

/**
 * 填充指定容器内的表单字段
 */
export function fillFieldsInContainer(
  mode: FillMode,
  container: HTMLElement,
  includeHidden: boolean = false,
): void {
  const inputs = container.querySelectorAll('input, textarea, select');

  inputs.forEach((element) => {
    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement
    ) {
      if (!isElementValidForFill(element)) {
        return;
      }

      if (!includeHidden) {
        if (element instanceof HTMLInputElement && element.type === 'hidden') {
          return;
        }
      }

      const fieldType = recognizeFieldType(element);
      const value = generateValueByFieldType(fieldType, mode);
      fillFieldWithInjector(element, value);
    }
  });
}

/**
 * 填充弹窗内的表单字段
 */
export function fillFieldsInActiveModal(mode: FillMode, includeHidden: boolean = false): boolean {
  const modal = findActiveModalContainer();
  if (modal) {
    fillFieldsInContainer(mode, modal, includeHidden);
    return true;
  }
  return false;
}

/**
 * 清空所有表单字段
 */
export function clearAllFields(): void {
  const inputs = document.querySelectorAll('input, textarea, select');

  inputs.forEach((element) => {
    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement
    ) {
      if (!isElementValidForFill(element)) {
        return;
      }

      if (element instanceof HTMLInputElement) {
        if (element.type === 'checkbox' || element.type === 'radio') {
          element.checked = false;
        } else {
          setInputValue(element, '');
        }
      } else if (element instanceof HTMLTextAreaElement) {
        setInputValue(element, '');
      } else if (element instanceof HTMLSelectElement) {
        element.selectedIndex = 0;
      }

      triggerEvents(element);
    }
  });
}

/**
 * 清空指定容器内的表单字段
 */
export function clearFieldsInContainer(container: HTMLElement): void {
  const inputs = container.querySelectorAll('input, textarea, select');

  inputs.forEach((element) => {
    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement
    ) {
      if (!isElementValidForFill(element)) {
        return;
      }

      if (element instanceof HTMLInputElement) {
        if (element.type === 'checkbox' || element.type === 'radio') {
          element.checked = false;
        } else {
          setInputValue(element, '');
        }
      } else if (element instanceof HTMLTextAreaElement) {
        setInputValue(element, '');
      } else if (element instanceof HTMLSelectElement) {
        element.selectedIndex = 0;
      }

      triggerEvents(element);
    }
  });
}
