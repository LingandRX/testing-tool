import { MessageAction, onMessage, sendMessage } from '@/utils/messages';

const BADGE_ID = 'testing-tools-right-click-restorer-badge';
const BADGE_STYLE_ID = 'testing-tools-right-click-restorer-badge-style';

let isRestored = false;

function updateBadge(): void {
  const badge = document.getElementById(BADGE_ID);
  if (badge) {
    badge.style.opacity = isRestored ? '1' : '0';
  }
}

function createBadge(): void {
  if (document.getElementById(BADGE_ID)) return;

  if (!document.getElementById(BADGE_STYLE_ID)) {
    const style = document.createElement('style');
    style.id = BADGE_STYLE_ID;
    style.textContent = `
      #${BADGE_ID} {
        position: fixed;
        bottom: 16px;
        right: 16px;
        z-index: 2147483646;
        padding: 6px 12px;
        background: #2e7d32;
        color: #ffffff;
        border-radius: 20px;
        font-size: 12px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        opacity: 0;
        transition: opacity 0.2s ease-out;
        pointer-events: none;
        user-select: none;
      }
      @media (prefers-color-scheme: dark) {
        #${BADGE_ID} {
          background: #4caf50;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }
      }
    `;
    document.head.appendChild(style);
  }

  const badge = document.createElement('div');
  badge.id = BADGE_ID;
  badge.textContent = '\u53f3\u952e\u5df2\u89e3\u9501';
  document.body.appendChild(badge);
}

/* ======================== Main World 注入 ======================== */

async function injectMainWorldScript(): Promise<void> {
  try {
    const response = await sendMessage(MessageAction.INJECT_MAIN_WORLD_SCRIPT);
    if (!response.success) {
      console.error('[RightClickRestorer] Background injection failed:', response.message);
    }
  } catch (err) {
    console.error('[RightClickRestorer] Failed to request main world injection:', err);
  }
}

/* ======================== Isolated World 事件拦截 ======================== */

function installEventIntercepts(): void {
  window.addEventListener(
    'contextmenu',
    (e) => {
      if (!isRestored) return;
      e.stopPropagation();
    },
    true,
  );

  // 部分网站在 mousedown 阶段阻止 contextmenu
  window.addEventListener(
    'mousedown',
    (e) => {
      if (!isRestored) return;
      if (e.button === 2 || (e.buttons & 2) !== 0) {
        e.stopPropagation();
      }
    },
    true,
  );
}

/* ======================== 遮罩层穿透 ======================== */

const MEDIA_TAGS = new Set(['IMG', 'VIDEO', 'CANVAS', 'SVG']);

function initMousePenetration(): void {
  window.addEventListener(
    'mousedown',
    (e) => {
      if (!isRestored || e.button !== 2) return;

      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      if (!elements.length) return;

      let targetMedia: HTMLElement | null = null;
      for (const el of elements) {
        if (MEDIA_TAGS.has(el.tagName)) {
          targetMedia = el as HTMLElement;
          break;
        }
      }

      if (!targetMedia) return;

      const modified: Array<{ el: HTMLElement; original: string | null }> = [];
      let foundMedia = false;

      for (const el of elements) {
        const htmlEl = el as HTMLElement;

        if (el === targetMedia) {
          foundMedia = true;
          const original = htmlEl.style.pointerEvents || null;
          htmlEl.style.setProperty('pointer-events', 'all', 'important');
          modified.push({ el: htmlEl, original });
          continue;
        }

        if (!foundMedia) {
          const original = htmlEl.style.pointerEvents || null;
          htmlEl.style.setProperty('pointer-events', 'none', 'important');
          modified.push({ el: htmlEl, original });
        }
      }

      setTimeout(() => {
        for (const { el, original } of modified) {
          if (original === null || original === '') {
            el.style.removeProperty('pointer-events');
          } else {
            el.style.pointerEvents = original;
          }
        }
      }, 300);
    },
    true,
  );
}

/* ======================== 激活保护 ======================== */

async function activateProtection(): Promise<void> {
  if (isRestored) return;

  await injectMainWorldScript();

  // 再次检查，防止并发调用导致重复注册
  if (isRestored) return;

  installEventIntercepts();
  initMousePenetration();

  isRestored = true;
  updateBadge();
}

/* ======================== 消息通信 ======================== */

function initMessaging(): void {
  onMessage(MessageAction.RESTORE_RIGHT_CLICK, async () => {
    await activateProtection();
    return { success: true, restored: isRestored };
  });

  onMessage(MessageAction.QUERY_RIGHT_CLICK_STATUS, () => {
    return { success: true, restored: isRestored };
  });
}

/* ======================== 入口 ======================== */

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createBadge, { once: true });
    } else {
      createBadge();
    }
    initMessaging();
  },
});
