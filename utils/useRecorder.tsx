import * as rrweb from 'rrweb';
import { listenerHandler } from '@rrweb/types';
import { getRecordConsolePlugin } from '@rrweb/rrweb-plugin-console-record';
import { sendMessage } from '@/utils/messages';

export const createRecorder = () => {
  let stopFn: listenerHandler | null = null;

  const startRecord = async () => {
    try {
      const handler = rrweb.record({
        emit(event) {
          sendMessage('content:save-tracke-events', event);
        },
        plugins: [getRecordConsolePlugin()],
      });

      stopFn = handler || null;

      console.log('[content] rrweb started');
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return false;
    }
  };

  const stopRecord = () => {
    if (stopFn) {
      stopFn();
      stopFn = null;
      console.log('[content] rrweb stopped');
    }
    return false;
  };

  return { startRecord, stopRecord };
};
