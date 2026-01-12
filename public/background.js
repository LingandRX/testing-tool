console.log('Background script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到消息:', request);

  if (request.action === 'copy') {
    console.log('开始复制文本:', request.text);

    navigator.clipboard.writeText(request.text)
      .then(() => {
        console.log('复制成功');
        sendResponse({success: true});
      })
      .catch((err) => {
        console.error('复制失败:', err);
        sendResponse({success: false, error: err.message});
      });

    return true; // 保持消息端口开放以支持异步响应
  }

  // 对于未知的操作，也返回响应
  sendResponse({success: false, error: '未知操作'});
  return false;
});