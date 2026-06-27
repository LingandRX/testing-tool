import { useEffect, useState } from 'react';
import { MessageAction, sendMessageToContent } from '@/utils/messages';
import { isUnsupportedPageUrl } from '@/utils/restrictedUrls';
import type { RestorerStatus } from './constants';

export interface UseRightClickRestorerReturn {
  domain: string;
  isLoading: boolean;
  status: RestorerStatus;
  unlock: () => Promise<void>;
}

export function useRightClickRestorer(): UseRightClickRestorerReturn {
  const [domain, setDomain] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<RestorerStatus>('locked');

  useEffect(() => {
    const load = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const url = tab?.url;

        setDomain(url ? new URL(url).hostname : '');

        if (isUnsupportedPageUrl(url)) {
          setStatus('unsupported');
          return;
        }

        const response = await sendMessageToContent(MessageAction.QUERY_RIGHT_CLICK_STATUS);
        if (response?.success) {
          setStatus(response.restored ? 'unlocked' : 'locked');
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
    if (status === 'unsupported') return;

    try {
      const response = await sendMessageToContent(MessageAction.RESTORE_RIGHT_CLICK);
      if (response?.success) {
        setStatus(response.restored ? 'unlocked' : 'locked');
      }
    } catch (err) {
      console.error('[RightClickRestorer] Failed to unlock:', err);
    }
  }

  return {
    domain,
    isLoading,
    status,
    unlock,
  };
}
