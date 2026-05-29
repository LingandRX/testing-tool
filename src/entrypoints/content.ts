import '../../.wxt/types/imports.d.ts';
import { initContextMenuHandler } from './content/contextMenuHandler';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_end',
  main() {
    initContextMenuHandler();
  },
});
