/**
 * 获取路由的路径和详情参数
 * @returns 
 */
export function getParamsUrl() {
  let hasDetail = location.hash.split('?');
  let hasName = hasDetail[0].split('#')[1];
  let params = hasDetail[1] ? hasDetail[1].split('&') : [];
  let query = {};

  for (let i = 0; i < params.length; i++) {
    let param = params[i].split('=');
    query[param[0]] = param[1];
  }

  return {
    path: hasName,
    query: query,
    params: params,
  };
}

export function closure(name) {
    function fun(currentHash) {
        window.name&&window[name](currentHash)
    }
    return fun;
}

export function genKey() {
    let temp = 'xxxxxxxx';
    return temp.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function hasClass(elem, cls) {
    cls = cls || '';
    if (cls.replace(/\s/g, '').length === 0)
        return false;
    return new RegExp(' ' + cls + ' ').test(' ' + elem.className + ' ');
}

export function addClass(elem, cls) {
    if (!hasClass(elem, cls)) {
        elem.className = elem.className === '' ? cls : elem.className + ' ' + cls;
    }
}

export function removeClass(elem, cls) {
    if (hasClass(elem, cls)) {
        let newClass = ' ' + elem.className.replace(/[\t\r\n]/g, '') + ' ';
        while (newClass.indexOf(' ' + cls + ' ') >= 0) {
            newClass = newClass.replace(' ' + cls + ' ', ' ');
        }
        elem.className = newClass.replace(/^\s+|\s+$/)
    }
}