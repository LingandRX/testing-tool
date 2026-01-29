export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
    if (msg.type === 'CREATE_OFFSCREEN') {
      const exists = await chrome.offscreen.hasDocument();
      if (!exists) {
        await chrome.offscreen.createDocument({
          url: 'offscreen.html',
          reasons: ['DISPLAY_MEDIA', 'USER_MEDIA', 'BLOBS', 'AUDIO_PLAYBACK'],
          justification: 'rrweb record & replay',
        });
        console.log('[bg] offscreen created');
      }
      sendResponse({ ok: true });
    }

    if (msg.type === 'DOWNLOAD') {
      console.log('[bg] DOWNLOAD received');
      chrome.downloads.download({
        url: msg.dataUrl,
        filename: `rrweb-${Date.now()}.json`,
        saveAs: true,
      });
    }
  });
});
