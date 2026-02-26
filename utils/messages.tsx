import { defineExtensionMessaging } from '@webext-core/messaging';

interface ProtocolMap {
  // --- Popup 相关 ---
  'popup:start': () => { ok: boolean; error?: string };
  'popup:stop': () => { ok: boolean; error?: string };
  'popup:started': () => void;
  'popup:stopped': () => void;
  'popup:tab-changed': (data: { currentTabId: number; recordingTabId: number | undefined }) => void;
  'popup:check-status': () => { active: boolean; startTime?: number };
  'popup:ready': () => void;

  // --- Content 相关 ---
  'content:save-track-events': (event: unknown) => boolean;
  'content:start-recording': () => { ok: boolean; error?: string };
  'content:stop-recording': () => { ok: boolean };
  'content:check-status': () => boolean;

  // --- Offscreen 相关 ---
  'offscreen:start-recording': (streamId: string) => void;
  'offscreen:stop-recording': () => void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
