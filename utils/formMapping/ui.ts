import { SmartDetector } from './scanner';
import { highlighter } from './highlighter';
import { storageUtil } from '@/utils/chromeStorage';
import { FormMapEntry } from '@/types/storage';

/**
 * 更新表单映射辅助 UI
 */
export async function updateMappingUI() {
  const entries = ((await storageUtil.get('active_form_map')) as FormMapEntry[]) || [];
  const isPicking = ((await storageUtil.get('app/formMapping/isPicking')) as boolean) || false;

  if (entries.length > 0 || isPicking) {
    highlighter.show();
    highlighter.draw(entries);

    if (isPicking) {
      highlighter.enablePicker(async (el) => {
        const fingerprint = SmartDetector.generateFingerprint(el);
        const label = SmartDetector.extractSemanticLabel(el);

        const newEntry: FormMapEntry = {
          id: Math.random().toString(36).substring(2, 9),
          label_display: label,
          fingerprint,
          action_logic: { type: 'text', strategy: 'fixed', value: '' },
          ui_state: { is_selected: true },
        };

        const currentMap = ((await storageUtil.get('active_form_map')) as FormMapEntry[]) || [];
        await storageUtil.set('active_form_map', [...currentMap, newEntry]);
        await storageUtil.set('app/formMapping/isPicking', false);
      });
    } else {
      highlighter.disablePicker();
    }
  } else {
    highlighter.hide();
  }
}

/**
 * 初始化表单映射助手
 */
export function initFormMappingHelper() {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && (changes['active_form_map'] || changes['app/formMapping/isPicking'])) {
      updateMappingUI().catch(console.error);
    }
  });

  // 初始加载
  updateMappingUI().catch(console.error);
}
