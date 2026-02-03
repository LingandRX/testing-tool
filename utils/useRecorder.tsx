import * as rrweb from 'rrweb';
import { listenerHandler } from '@rrweb/types';

export const createRecorder = () => {
  let stopFn: listenerHandler | null = null;

  const startRecord = async (msg: string) => {
    try {
      // const handler = null;
      const handler = rrweb.record({
        emit(event) {
          chrome.runtime.sendMessage({
            type: msg,
            payload: event,
          });
        },
      });

      stopFn = handler || null;

      console.log('[content] rrweb started');
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecord = () => {
    if (stopFn) {
      stopFn();
      stopFn = null;
      console.log('[content] rrweb stopped');
    }
  };

  return { startRecord, stopRecord };
};
