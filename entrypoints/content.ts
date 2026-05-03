import '../.wxt/types/imports.d.ts';
import { initMessageHandler } from './content/messageHandler';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_end',
  main() {
    initMessageHandler();
  },
});
