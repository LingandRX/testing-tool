import { useState, useEffect, useCallback } from 'react';
import { MessageAction, onMessage } from '@/utils/messages';
import { useSnackbar } from '@/components/GlobalSnackbar';

/**
 * 管理侧边栏状态检测与开启逻辑的 Hook
 */
export function useSidePanelState() {
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const { showMessage } = useSnackbar();

  const checkSidePanelState = useCallback(async () => {
    try {
      if (typeof chrome.runtime.getContexts === 'function') {
        const contexts = await chrome.runtime.getContexts({
          contextTypes: ['SIDE_PANEL'],
        });
        setSidePanelOpen(contexts.length > 0);
      } else {
        setSidePanelOpen(false);
      }
    } catch (error) {
      console.error('检测侧边栏状态失败:', error);
      setSidePanelOpen(false);
    }
  }, []);

  useEffect(() => {
    // 使用 requestAnimationFrame 避免同步调用 setState
    requestAnimationFrame(() => {
      checkSidePanelState();
    });

    // 监听侧边栏状态变化消息
    const removeListener = onMessage(MessageAction.SIDE_PANEL_STATE_CHANGED, (message) => {
      setSidePanelOpen(message.data.isOpen);
    });

    return () => {
      removeListener();
    };
  }, [checkSidePanelState]);

  const handleOpenSidePanel = useCallback(async () => {
    try {
      await chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
      setSidePanelOpen(true);
      showMessage('侧边栏已打开', { severity: 'success' });
    } catch (error) {
      console.error('打开侧边栏失败:', error);
      showMessage('打开侧边栏失败', { severity: 'error' });
    }
  }, [showMessage]);

  return {
    sidePanelOpen,
    handleOpenSidePanel,
    checkSidePanelState,
  };
}
