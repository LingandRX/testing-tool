chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'start') {
    navigator.clipboard.writeText(request.text)
      .then(() => sendResponse({success: true}))
      .catch((err) => console.log(err));
    return true;
  }
});