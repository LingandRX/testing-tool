export const messages = {
  popup: {
    from: {
      start: 'popup:start',
      stop: 'popup:stop',
    },
    to: {
      stoped: 'popup:stoped',
      started: 'popup:started',
    },
    checkStatus: 'popup:check-status',
    ready: 'popup:ready',
  },
  content: {
    from: {
      saveTrackeEvents: 'content:save-tracke-events',
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
