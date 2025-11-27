/**
 * 获取路由的路径和详细参数
 * @returns
 */
export function getParamsUrl() {
  // 获取路由
  const hasDetail = location.hash.split('?');
  // 获取路由名称
  const hasName = hasDetail[0].split('#')[1];
  // 获取请求参数
  const params = hasDetail[1] ? hasDetail[1].split('&') : [];
  // 解析请求参数
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

/**
 * 闭包返回函数
 * @param {*} name
 * @returns
 */
export function closure(name) {
  return (currentHash) => {
    window.name && window[name](currentHash);
  };
}

/**
 * 生成随机key
 * @returns
 */
export function genKey() {
  const KEY_TEMPLATE = 'xxxxxxxx';
  return KEY_TEMPLATE.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
