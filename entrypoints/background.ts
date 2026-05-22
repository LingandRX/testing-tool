import '../.wxt/types/imports.d.ts';
import { browser } from 'wxt/browser';
import { MessageAction, onMessage, sendMessage } from '@/utils/messages';
import { createAllContextMenus, parseContextMenuClick } from '@/utils/contextMenu';
import { saveContextMenuData } from '@/utils/useContextMenuData';

export default defineBackground(() => {
  // 1. 扩展初次安装或更新时，注册右键上下文大闸
  browser.runtime.onInstalled.addListener(() => {
    createAllContextMenus();
  });

  // 2. 右键点击中央中枢路由
  browser.contextMenus.onClicked.addListener(async (info, _tab) => {
    const result = parseContextMenuClick(info.menuItemId as string, info);

    if (!result.success || !result.data) {
      if (result.error) {
        console.warn('[Context Menu Warning]', result.error);
      }
      return;
    }

    const { featureKey, payload } = result.data;

    try {
      // 检查侧边栏（Side Panel）的挂载激活状态
      const sidePanelState = await browser.storage.local.get('sidePanelOpen');
      const isSidePanelOpen = sidePanelState.sidePanelOpen === true;

      if (isSidePanelOpen) {
        // 如果侧边栏正开着，利用高性能管道直发
        await sendMessage(MessageAction.CONTEXT_MENU_CLICKED, { featureKey, payload });
        return;
      }
    } catch (err) {
      console.debug('[Context Menu] Side panel pipeline is not available:', err);
    }

    // 💡 核心自愈机制：保存数据到共享沙箱 Storage，Popup 打开后（无论是自动还是手动）都会读取
    await saveContextMenuData({ featureKey, payload });

    // 打开 popup 弹窗
    try {
      await browser.action.openPopup();
    } catch (err) {
      // 💡 修复点：自动打开 Popup 失败时，绝对不能将 pendingData 撕毁！
      // 保持数据留在 storage 内部，由于 Service Worker 的持久化，用户之后不管什么时候手动点开图标，
      // 数据依旧完好如初，完美契合了你的设计注释！
      console.warn(
        '[Context Menu] 自动打开 popup 失败，请手动点击扩展图标，暂存数据已安全保留在内存中:',
        err,
      );
    }
  });

  // 监听扩展图标点击事件，安全激活侧边栏
  browser.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      try {
        await browser.sidePanel.open({ tabId: tab.id });
      } catch (err) {
        console.error('Failed to open side panel via extension action clicked:', err);
      }
    }
  });

  // 💡 3. 异步刷新请求监听
  onMessage(MessageAction.RELOAD_TAB, async (message) => {
    const { tabId, delay = 0 } = message.data;

    const executeReload = () => {
      browser.tabs.reload(tabId).catch((err) => {
        console.error('Failed to execute tab reload operation:', err);
      });
    };

    // 如果小于 1000ms（短抖动缓冲），可以使用极轻量级 setTimeout 防御
    // 如果是秒级以上的延时，为防止 Service Worker 闲置被内核销毁，应当使用 Alarms 沙箱驱动
    if (delay > 0 && delay < 1000) {
      setTimeout(executeReload, delay);
    } else if (delay >= 1000) {
      const alarmName = `reload-tab-${tabId}-${Date.now()}`;

      // 创建一个临时的一次性 Alarm 闹钟
      await browser.alarms.create(alarmName, { when: Date.now() + delay });

      // 动态注册一个一次性的生命周期续航守卫
      const alarmListener = (alarm: { name: string }) => {
        if (alarm.name === alarmName) {
          executeReload();
          browser.alarms.onAlarm.removeListener(alarmListener);
        }
      };
      browser.alarms.onAlarm.addListener(alarmListener);
    } else {
      executeReload();
    }

    return { success: true, message: '刷新请求已通过常驻 Service Worker 安全隔离区' };
  });
});
