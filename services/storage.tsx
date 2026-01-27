// src/services/storage.ts
import {isExtension} from '../utils/env';

export const storage = {
  set: async (items) => {
    if (isExtension()) {
      return chrome.storage.local.set(items);
    } else {
      // Web 兼容：写入 localStorage
      Object.keys(items).forEach(key => {
        localStorage.setItem(key, JSON.stringify(items[key]));
      });
      return Promise.resolve();
    }
  },
  
  get: async (keys) => {
    if (isExtension()) {
      return chrome.storage.local.get(keys);
    } else {
      // Web 兼容：读取 localStorage
      const result = {};
      const keyList = Array.isArray(keys) ? keys : [keys];
      keyList.forEach(key => {
        const val = localStorage.getItem(key);
        if (val) result[key] = JSON.parse(val);
      });
      return Promise.resolve(result);
    }
  },
  
  remove: async (key) => {
    if (isExtension()) {
      return chrome.storage.local.remove(key);
    } else {
      localStorage.removeItem(key);
      return Promise.resolve();
    }
  }
};