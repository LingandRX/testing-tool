// 导入时间戳工具的初始化函数和事件处理
import './timestamp.js';

// 导入页面切换功能
import { switchPage } from '../utils/domUtils.js';

// 页面切换逻辑
import { addEventListenerById } from '../utils/domUtils.js';

addEventListenerById('nav-timestamp-btn', 'click', () => {
  switchPage('timestamp');
});

// 计时器页面切换
addEventListenerById('nav-other-tools-btn', 'click', () => {
  switchPage('other-tools');
});