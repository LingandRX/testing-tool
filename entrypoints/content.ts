import '../.wxt/types/imports.d.ts';
import { createRecorder } from '@/utils/useRecorder';
import { onMessage } from '@/utils/messages.tsx';

export default defineContentScript({
  // matches: ['*://*.google.com/*'],
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main() {
    const recorder = createRecorder();
    let isRecording = false;

    onMessage('content:check-status', () => {
      console.log(`[content]${isRecording}`);
      return isRecording;
    });

    onMessage('content:start-recording', async () => {
      try {
        const started = await recorder.startRecord();
        if (started) {
          isRecording = true;
          return { ok: true };
        } else {
          return { ok: false, error: 'Failed to start recorder' };
        }
      } catch (error) {
        console.error('Error handling start recording:', error);
        return { ok: false };
      }
    });

    onMessage('content:stop-recording', () => {
      try {
        console.log('[content] stopRecording received');
        recorder.stopRecord();
        isRecording = false;
        return { ok: true };
      } catch (error) {
        console.error('Error handling stop recording:', error);
        return { ok: false };
      }
    });
  },
});
