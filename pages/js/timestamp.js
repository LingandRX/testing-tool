import {createPageModule} from "../../libs/page-module-factory";

let showMilliseconds = true;

export default createPageModule({
  pageName: 'timestamp',

  onInit: async (controller, state) => {
    console.log('初始化首页（工厂模式）');

    const {sharedModules, updateText, bindEvent} = controller;
    const utils = sharedModules?.utils;

    // 绑定事件
    bindEvent('#test-action', 'click', () => {
      controller.stateManager.addHistory('执行了测试操作');
      controller.showNotification('测试操作已执行');
      controller.stateManager.incrementUsage();
    });

    updateText('current-timestamp-value', getCurrentTimestamp(showMilliseconds));
  },

  onStateUpdate: (controller, newState) => {
    const {updateText} = controller;

    updateText('usage-count', newState.stats.usageCount);
    updateText('page-switches', newState.stats.pageSwitches);
    updateText('history-count', newState.stats.historyCount);
    updateText('settings-count', newState.stats.settingsCount);
  },

  onDestroy: (controller) => {
    console.log('清理首页（工厂模式）');
  }
});

/**
 * 获取当前时间戳
 * @param {*} showMilliseconds
 */
function getCurrentTimestamp(showMilliseconds = true) {
  const timestamp = Date.now();
  return showMilliseconds ? timestamp : Math.floor(timestamp / 1000);
}