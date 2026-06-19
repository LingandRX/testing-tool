import { useEffect, useState } from 'react';
import { MessageAction, sendMessageToContent } from '@/utils/messages';
import type { RestorerStatus } from './constants';

const UNSUPPORTED_PROTOCOLS = new Set([
  'chrome:',
  'chrome-extension:',
  'about:',
  'edge:',
  'brave:',
]);

function isUnsupportedPage(url: string | undefined): boolean {
  if (!url) return true;
  try {
    const protocol = new URL(url).protocol;
    return UNSUPPORTED_PROTOCOLS.has(protocol);
  } catch {
    return true;
  }
}

function deriveStatus(isUnsupported: boolean, isUnlocked: boolean): RestorerStatus {
  if (isUnsupported) return 'unsupported';
  return isUnlocked ? 'unlocked' : 'locked';
}

export interface UseRightClickRestorerReturn {
  domain: string;
  isLoading: boolean;
  status: RestorerStatus;
  unlock: () => Promise<void>;
}

export function useRightClickRestorer(): UseRightClickRestorerReturn {
  const [domain, setDomain] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [isUnsupported, setIsUnsupported] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const url = tab?.url;

        setDomain(url ? new URL(url).hostname : '');

        if (isUnsupportedPage(url)) {
          setIsUnsupported(true);
          return;
        }

        const response = await sendMessageToContent(MessageAction.QUERY_RIGHT_CLICK_STATUS);
        if (response?.success) {
          setIsUnlocked(response.restored);
        }
      } catch (err) {
        console.error('[RightClickRestorer] Failed to load state:', err);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  async function unlock() {
    if (isUnsupported) return;

    try {
      const response = await sendMessageToContent(MessageAction.RESTORE_RIGHT_CLICK);
      if (response?.success) {
        setIsUnlocked(response.restored);
      }
    } catch (err) {
      console.error('[RightClickRestorer] Failed to unlock:', err);
    }
  }

  return {
    domain,
    isLoading,
    status: deriveStatus(isUnsupported, isUnlocked),
    unlock,
  };
}
