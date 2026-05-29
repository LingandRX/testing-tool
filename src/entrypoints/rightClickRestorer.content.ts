import { MessageAction, onMessage, sendMessage } from '@/utils/messages';

let isRestored = false;

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

/* ======================== 激活保护 ======================== */

async function activateProtection(): Promise<void> {
  if (isRestored) return;

  await injectMainWorldScript();

  // 再次检查，防止并发调用导致重复注册
  if (isRestored) return;

  installEventIntercepts();

  isRestored = true;
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
    initMessaging();
  },
});
