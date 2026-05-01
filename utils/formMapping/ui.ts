import { SmartDetector } from './scanner';
import { highlighter } from './highlighter';
import { storageUtil } from '@/utils/chromeStorage';
import { FormMapEntry } from '@/types/storage';

/**
 * 更新表单映射辅助 UI
 */
export async function updateMappingUI(forcePickerUpdate = false) {
  const isPicking = ((await storageUtil.get('app/formMapping/isPicking')) as boolean) || false;
  const entries = ((await storageUtil.get('active_form_map')) as FormMapEntry[]) || [];

  if (isPicking) {
    highlighter.show();
    highlighter.draw(entries);

    if (forcePickerUpdate) {
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

        // 拾取成功后，如果是“单次拾取”逻辑，可以自动关闭
        // await storageUtil.set('app/formMapping/isPicking', false);

        // 如果是“连续拾取”，由于 active_form_map 变化会触发 updateMappingUI，
        // 我们需要确保它不会因为 storage 变化而反复调用 enablePicker。
      });
    }
  } else {
    highlighter.hide();
    highlighter.disablePicker();
  }
}

/**
 * 初始化表单映射助手
 */
export function initFormMappingHelper() {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      if (changes['app/formMapping/isPicking']) {
        // 当拾取状态变化时，强制更新 Picker 逻辑
        updateMappingUI(true).catch(console.error);
      } else if (changes['active_form_map']) {
        // 当数据变化时，仅更新绘制内容，不重新绑定 Picker
        updateMappingUI(false).catch(console.error);
      }
    }
  });

  // 初始加载
  updateMappingUI(true).catch(console.error);
}
