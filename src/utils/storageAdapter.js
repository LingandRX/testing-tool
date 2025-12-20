// 判断当前是否处于 Chrome 插件环境
const isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

const storageAdapter = {
  // 获取数据
  get: async (key) => {
    if (isExtension) {
      const result = await chrome.storage.local.get([key]);
      return result[key];
    } else {
      const item = localStorage.getItem(key);
      try {
        return JSON.parse(item); // 保持与插件版一致的对象处理
      } catch {
        return item;
      }
    }
  },
  
  // 设置数据
  set: async (key, value) => {
    if (isExtension) {
      await chrome.storage.local.set({[key]: value});
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
};

export default storageAdapter;