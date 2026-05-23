import '../.wxt/types/imports.d.ts';
import { browser } from 'wxt/browser';
import { MessageAction, onMessage, sendMessage } from '@/utils/messages';
import { createAllContextMenus, parseContextMenuClick } from '@/utils/contextMenu';
import { saveContextMenuData } from '@/utils/useContextMenuData';

export default defineBackground(() => {
  // 1. 扩展初次安装或更新时，注册右键上下文菜单
  browser.runtime.onInstalled.addListener(() => {
    createAllContextMenus();
  });

  // 2. 右键点击路由
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
      const sidePanelState = await browser.storage.local.get('sidePanelOpen');
      const isSidePanelOpen = sidePanelState.sidePanelOpen === true;

      if (isSidePanelOpen) {
        await sendMessage(MessageAction.CONTEXT_MENU_CLICKED, { featureKey, payload });
        return;
      }
    } catch (err) {
      console.debug('[Context Menu] Side panel pipeline is not available:', err);
    }

    await saveContextMenuData({ featureKey, payload });

    try {
      await browser.action.openPopup();
    } catch (err) {
      console.warn(
        '[Context Menu] 自动打开 popup 失败，请手动点击扩展图标，暂存数据已安全保留:',
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

  // 3. 注入主环境脚本（content script 无权访问 chrome.tabs/scripting，委托 background 执行）
  onMessage(MessageAction.INJECT_MAIN_WORLD_SCRIPT, async (message) => {
    const sender = message.sender as chrome.runtime.MessageSender | undefined;
    const tabId = sender?.tab?.id;

    if (!tabId) {
      console.warn('[RightClickRestorer] Injection request missing tabId');
      return { success: false, message: 'Missing tabId' };
    }

    try {
      await browser.scripting.executeScript({
        target: { tabId },
        func: () => {
          'use strict';
          const w = window as unknown as Record<string, unknown>;
          if (w.__testingToolsRightClickPatched) return;
          w.__testingToolsRightClickPatched = true;

          const PROTECTED = ['contextmenu', 'copy', 'paste', 'cut', 'selectstart'];

          /* 1. 屏蔽 MouseEvent.prototype.preventDefault（含 mousedown 右键） */
          const _origPreventDefault = MouseEvent.prototype.preventDefault;
          Object.defineProperty(MouseEvent.prototype, 'preventDefault', {
            value: function (this: MouseEvent) {
              const t = this.type;
              if (PROTECTED.includes(t) || (t === 'mousedown' && this.button === 2)) {
                return;
              }
              return _origPreventDefault.call(this);
            },
            writable: true,
            configurable: true,
          });

          /* 2. 屏蔽 Event.prototype.stopPropagation / stopImmediatePropagation */
          const _origStopPropagation = Event.prototype.stopPropagation;
          Object.defineProperty(Event.prototype, 'stopPropagation', {
            value: function (this: Event) {
              if (PROTECTED.includes(this.type)) return;
              return _origStopPropagation.call(this);
            },
            writable: true,
            configurable: true,
          });

          const _origStopImmediatePropagation = Event.prototype.stopImmediatePropagation;
          Object.defineProperty(Event.prototype, 'stopImmediatePropagation', {
            value: function (this: Event) {
              if (PROTECTED.includes(this.type)) return;
              return _origStopImmediatePropagation.call(this);
            },
            writable: true,
            configurable: true,
          });

          /* 3. 拦截 document.oncontextmenu（处理 return false 方式） */
          let _docOnContextMenu: unknown = null;
          Object.defineProperty(document, 'oncontextmenu', {
            get() {
              return _docOnContextMenu;
            },
            set(fn: unknown) {
              if (typeof fn === 'function') {
                _docOnContextMenu = function (this: GlobalEventHandlers, e: MouseEvent) {
                  const r = (fn as (this: GlobalEventHandlers, ev: MouseEvent) => unknown).call(
                    this,
                    e,
                  );
                  return r === false ? true : r;
                };
              } else {
                _docOnContextMenu = fn;
              }
            },
            configurable: true,
          });
        },
        world: 'MAIN',
      });

      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('[RightClickRestorer] executeScript failed:', errorMsg);
      return { success: false, message: errorMsg };
    }
  });

  // 4. 异步刷新请求监听（统一使用 alarms API，避免 MV3 Service Worker 被销毁导致任务丢失）
  onMessage(MessageAction.RELOAD_TAB, async (message) => {
    const { tabId, delay = 0 } = message.data;

    const executeReload = () => {
      browser.tabs.reload(tabId).catch((err) => {
        console.error('Failed to execute tab reload operation:', err);
      });
    };

    if (delay <= 0) {
      executeReload();
      return { success: true };
    }

    const alarmName = `reload-tab-${tabId}-${Date.now()}`;

    // 创建一次性 Alarm，由浏览器内核保障触发（不受 Service Worker 生命周期影响）
    await browser.alarms.create(alarmName, { when: Date.now() + delay });

    // 兜底清理：若 alarm 因异常未触发，delay 后 5 秒强制移除监听器并清理 alarm
    const cleanupTimeout = setTimeout(() => {
      browser.alarms.onAlarm.removeListener(alarmListener);
      browser.alarms.clear(alarmName).catch(() => {});
    }, delay + 5000);

    const alarmListener = (alarm: { name: string }) => {
      if (alarm.name !== alarmName) return;

      clearTimeout(cleanupTimeout);
      executeReload();
      browser.alarms.onAlarm.removeListener(alarmListener);
      browser.alarms.clear(alarmName).catch(() => {});
    };

    browser.alarms.onAlarm.addListener(alarmListener);

    return { success: true };
  });
});
