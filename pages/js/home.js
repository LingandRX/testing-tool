/**
 * 使用工厂创建首页模块
 */
import { createPageModule } from '../../libs/page-module-factory.js';

export default createPageModule({
  pageName: 'home',

  onInit: async (controller, state) => {
    console.log('初始化首页（工厂模式）');

    const { sharedModules, updateText, bindEvent } = controller;
    const utils = sharedModules?.utils;

    // 更新时间
    if (utils) {
      updateText('current-date', `当前时间: ${utils.formatDate(new Date(), 'YYYY年MM月DD日 HH:mm')}`);
    }

    // 更新统计
    updateText('usage-count', state.stats.usageCount);
    updateText('page-switches', state.stats.pageSwitches);
    updateText('history-count', state.stats.historyCount);
    updateText('settings-count', state.stats.settingsCount);

    // 绑定事件
    bindEvent('#test-action', 'click', () => {
      controller.stateManager.addHistory('执行了测试操作');
      controller.showNotification('测试操作已执行');
      controller.stateManager.incrementUsage();
    });

    bindEvent('#quick-settings', 'click', () => {
      controller.stateManager.navigateTo('settings');
    });

    // 演示共享模块功能
    if (utils) {
      bindEvent('#demo-debounce', 'click', utils.debounce(() => {
        controller.emit('demoClicked', { time: new Date() });
        updateText('demo-output', `防抖演示: ${utils.formatDate(new Date(), 'HH:mm:ss')}`);
      }, 1000));

      bindEvent('#demo-format', 'click', () => {
        updateText('demo-output', `格式化结果: ${utils.formatDate(new Date(), 'YYYY年MM月DD日 dddd HH:mm:ss')}`);
      });
    }
  },

  onStateUpdate: (controller, newState) => {
    const { updateText } = controller;

    updateText('usage-count', newState.stats.usageCount);
    updateText('page-switches', newState.stats.pageSwitches);
    updateText('history-count', newState.stats.historyCount);
    updateText('settings-count', newState.stats.settingsCount);
  },

  onDestroy: (controller) => {
    console.log('清理首页（工厂模式）');
  }
});