/**
 * DOM工具类函数
 */

/**
 * 为元素添加事件监听器
 * @param {string} id - 元素ID
 * @param {string} event - 事件类型
 * @param {Function} handler - 事件处理函数
 */
export function addEventListenerById(id, event, handler) {
  const ele = document.getElementById(id);
  if (ele) {
    window.eventManager.add(ele, event, handler);
  }
}

/**
 * 判断元素是否包含指定类名
 * @param {*} elem
 * @param {*} cls
 * @returns
 */
export function hasClass(elem, cls) {
  cls = cls || '';
  // 检测类名是否为''
  if (cls.replace(/\s/g, '').length === 0) return false;
  // 检测elem类名是否包含cls指定类名
  return new RegExp(' ' + cls + ' ').test(' ' + elem.className + ' ');
}

/**
 * 为元素添加类名
 * @param {*} elem
 * @param {*} cls
 */
export function addClass(elem, cls) {
  if (!elem || !cls) return;

  // 统一空白字符（避免 \n \t 等导致匹配问题）
  let current = elem.className.replace(/[\t\r\n]/g, ' ').trim();

  // 已存在则忽略
  const classes = current.split(/\s+/);
  if (classes.includes(cls)) return;

  // 添加并规整
  classes.push(cls);
  elem.className = classes.join(' ').trim();
}

/**
 * 为元素删除类名
 * @param {*} elem
 * @param {*} cls
 */
export function removeClass(elem, cls) {
  if (!elem || !cls) return;

  // 使用 classList 优先（更安全）
  if (elem.classList) {
    elem.classList.remove(cls);
    return;
  }

  // 传统写法的修复版本
  let klass = ' ' + elem.className.replace(/[\t\r\n]/g, ' ') + ' ';

  // 持续删除目标 class
  while (klass.indexOf(' ' + cls + ' ') !== -1) {
    klass = klass.replace(' ' + cls + ' ', ' ');
  }

  // 过滤多余空格
  elem.className = klass.trim().replace(/\s+/g, ' ');
}
