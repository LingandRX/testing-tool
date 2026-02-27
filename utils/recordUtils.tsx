export const downloadHtmlInBackground = (events: unknown[]) => {
  if (!events || events.length === 0) return;

  // 安全转义
  const safeEventsString = JSON.stringify(events)
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/<\/script>/g, '<\\/script>');

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>RRWeb 回放</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/rrweb-player@latest/dist/style.css" />
  <style>
    body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f2f5; }
    #player { width: 100%; max-width: 1024px; }
  </style>
</head>
<body>
  <div id="player"></div>

  <!-- 使用 UMD 版本，rrwebPlayer 会作为全局变量 -->
  <script src="https://cdn.jsdelivr.net/npm/rrweb-player@latest/dist/index.js"></script>

  <script type="module">
    import { getReplayConsolePlugin } from 'https://esm.sh/@rrweb/rrweb-plugin-console-replay?bundle';

    const events = JSON.parse(\`${safeEventsString}\`);

    // rrwebPlayer 作为全局变量可用
    new rrwebPlayer({
      target: document.getElementById('player'),
      props: {
        events: events,
        width: 1024,
        height: 576,
        autoPlay: true,
        showController: true,
        UNSAFE_replayCanvas: true,
        plugins: [
          getReplayConsolePlugin({
            level: ['info', 'log', 'warn', 'error'],
          }),
        ],
      },
    });
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
      .then((r) => console.log(r));
  };
  reader.readAsDataURL(blob);
};
