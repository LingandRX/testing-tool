export const downloadHtmlInBackground = (events: unknown[]) => {
  if (!events || events.length === 0) return;

  // 安全转义
  const safeEventsString = JSON.stringify(events)
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/<\/script>/g, '<\\/script>');

  // 使用固定版本的 rrweb-player，确保与项目使用的 rrweb 版本兼容
  const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>RRWeb 回放</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/rrweb-player@1.0.0-alpha.4/dist/style.css" />
  <style>
    body {
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f0f2f5;
    }
    #player {
      width: 100%;
      max-width: 1024px;
    }
  </style>
</head>
<body>
  <div id="player"></div>

  <!-- 使用与项目 rrweb 版本匹配的 rrweb-player -->
  <script src="https://cdn.jsdelivr.net/npm/rrweb-player@1.0.0-alpha.4/dist/index.js"></script>

  <script>
    try {
      // 解析事件数据
      const events = JSON.parse(\`${safeEventsString}\`);
      console.log('Loaded events count:', events.length);

      // 创建播放器
      const player = new rrwebPlayer({
        target: document.getElementById('player'),
        props: {
          events: events,
          width: 1024,
          height: 576,
          autoPlay: true,
          showController: true,
          UNSAFE_replayCanvas: true
        },
      });

      console.log('Player created successfully');
    } catch (error) {
      console.error('Replay error:', error);
      document.body.innerHTML = \`
        <div style="padding: 20px; text-align: center; color: #d32f2f;">
          <h2>回放失败</h2>
          <p>\${error.message}</p>
          <p>请检查控制台（F12）获取详细错误信息。</p>
        </div>
      \`;
    }
  </script>
</body>
</html>`;

  // 下载逻辑
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const reader = new FileReader();
  reader.onload = () => {
    chrome.downloads
      .download({
        url: reader.result as string,
        filename: `replay-${Date.now()}.html`,
        saveAs: true,
      })
      .then((r) => console.log('Download started:', r));
  };
  reader.readAsDataURL(blob);
};
