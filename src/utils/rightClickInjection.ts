/**
 * 右键解锁功能的主环境注入脚本
 *
 * 由于 content script 运行在 Isolated World，无法直接修改网页主环境的
 * Event.prototype.preventDefault 等原生方法。需要通过 background
 * 的 scripting.executeScript({ world: 'MAIN' }) 注入此脚本。
 */

/**
 * 在网页主环境中执行的注入函数
 * 注意：此函数会被序列化后通过 executeScript 注入，不能引用外部变量
 */
export function mainWorldInjectionScript(): void {
  'use strict';
  const w = window as unknown as Record<string, unknown>;
  if (w.__testingToolsRightClickPatched) return;
  w.__testingToolsRightClickPatched = true;

  const PROTECTED = ['contextmenu', 'copy', 'paste', 'cut', 'selectstart'];

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

  let _docOnContextMenu: unknown = null;
  Object.defineProperty(document, 'oncontextmenu', {
    get() {
      return _docOnContextMenu;
    },
    set(fn: unknown) {
      if (typeof fn === 'function') {
        _docOnContextMenu = function (this: GlobalEventHandlers, e: MouseEvent) {
          const r = (fn as (this: GlobalEventHandlers, ev: MouseEvent) => unknown).call(this, e);
          return r === false ? true : r;
        };
      } else {
        _docOnContextMenu = fn;
      }
    },
    configurable: true,
  });
}
