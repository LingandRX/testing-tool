import { defineExtensionMessaging } from '@webext-core/messaging';

export const messages = {
  popup: {
    from: {
      start: 'popup:start',
      stop: 'popup:stop',
    },
    to: {
      stopped: 'popup:stopped',
      started: 'popup:started',
      tabChanged: 'popup:tab-changed',
    },
    checkStatus: 'popup:check-status',
    ready: 'popup:ready',
  },
  content: {
    from: {
      saveTrackEvents: 'content:save-track-events',
    },
    to: {
      startRecording: 'content:start-recording',
      stopRecording: 'content:stop-recording',
    },
    checkStatus: 'content:check-status',
  },
  offscreen: {
    to: {
      startRecording: 'offscreen:start-recording',
      stopRecording: 'offscreen:stop-recording',
    },
  },
};

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
