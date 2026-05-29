import { useCallback, useEffect, useState } from 'react';
import { MessageAction, sendMessageToContent } from '@/utils/messages';

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

export interface UseRightClickRestorerReturn {
  domain: string;
  isLoading: boolean;
  isUnlocked: boolean;
  isUnsupported: boolean;
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
          setIsLoading(false);
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

  const unlock = useCallback(async () => {
    if (isUnsupported) return;

    try {
      const response = await sendMessageToContent(MessageAction.RESTORE_RIGHT_CLICK);
      if (response?.success) {
        setIsUnlocked(response.restored);
      }
    } catch (err) {
      console.error('[RightClickRestorer] Failed to unlock:', err);
    }
  }, [isUnsupported]);

  return {
    domain,
    isLoading,
    isUnlocked,
    isUnsupported,
    unlock,
  };
}
