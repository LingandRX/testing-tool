import '../.wxt/types/imports.d.ts';
import { initFormMappingHelper } from '@/utils/formMapping/ui';
import { initMessageHandler } from './content/messageHandler';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_end',
  main() {
    // 初始化表单映射助手逻辑 (UI, Picker, Highlighter)
    initFormMappingHelper();

    // 初始化消息处理器 (Scan, Fill, Clear, Highlight, Flash, Inject)
    initMessageHandler();
  },
});
