export const downloadHtmlInBackground = (events: unknown[]) => {
  if (!events || events.length === 0) return;

  // 安全转义 (保持之前的修复)
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
</head>
<body style="margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f2f5;">
  <div id="player"></div>
  
  <script src="https://cdn.jsdelivr.net/npm/rrweb-player@latest/dist/index.js"></script>
  
  <script type="module">
    import { getReplayConsolePlugin } from 'https://esm.sh/@rrweb/rrweb-plugin-console-replay?bundle'; 
    import rrwebPlayer from 'rrweb-player';

    const events = JSON.parse(\`${safeEventsString}\`);

    new rrwebPlayer({
      target: document.getElementById('player'),
      props: {
        events: events,
        width: 1024,
        height: 576,
        autoPlay: true,
        showController: true,
        
        // --- 👇 关键修复：添加下面这行 ---
        // 这会告诉 rrweb 关闭严格的 iframe 沙盒限制
        // 从而消除 "Blocked script execution" 错误
        // @ts-ignore
        UNSAFE_replayCanvas: true, 
        // ------------------------------

        // @ts-ignore
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

  // 下载逻辑 (保持不变)
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const reader = new FileReader();
  reader.onload = () => {
    chrome.downloads.download({
      url: reader.result as string,
      filename: `replay-${Date.now()}.html`,
      saveAs: true,
    }).then(r => console.log(r));
  };
  reader.readAsDataURL(blob);
};
