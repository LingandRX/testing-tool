import type { ContextMenuClickedPayload } from '@/utils/messages';
import { MessageAction, onMessage } from '@/utils/messages';
import { getTextStats } from '@/utils/textStatistics';
import { getMessage } from '@/utils/chromeI18n';
import { hidePopover, showTextStatsResult, showTimestampResult } from './uiPopover';

function convertTimestamp(input: string): string {
  const invalidText = getMessage('invalidTimestamp') || 'Invalid Timestamp';
  const num = Number(input.trim());

  if (isNaN(num)) {
    return invalidText;
  }

  // 1e12 判定毫秒级/秒级时间戳兼容
  const d = num > 1e12 ? new Date(num) : new Date(num * 1000);

  if (isNaN(d.getTime())) {
    return invalidText;
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

let lastClickX = 0;
let lastClickY = 0;

document.addEventListener(
  'contextmenu',
  (e) => {
    lastClickX = e.clientX;
    lastClickY = e.clientY;
  },
  { capture: true, passive: true },
);

export function initContextMenuHandler(): void {
  const dismissPopover = (): void => {
    hidePopover();
  };

  document.addEventListener('click', dismissPopover, { passive: true });
  document.addEventListener('scroll', dismissPopover, { passive: true });
  window.addEventListener('resize', dismissPopover, { passive: true });

  onMessage(MessageAction.CONTEXT_MENU_CLICKED, (message) => {
    const { featureKey, payload } = message.data as ContextMenuClickedPayload;

    switch (featureKey) {
      case 'timestamp': {
        const result = convertTimestamp(payload);
        showTimestampResult(lastClickX, lastClickY, payload, result);
        break;
      }

      case 'textStatistics': {
        const stats = getTextStats(payload);
        showTextStatsResult(lastClickX, lastClickY, payload, stats);
        break;
      }

      default:
        hidePopover();
        break;
    }
  });
}
