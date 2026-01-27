// import rrwebPlayer from 'rrweb-player';

export const downloadHtml = (events) => {
  if (events.length === 0) return;
  
  // 1. 构建 HTML 模板字符串
  // 我们将 events 数据直接注入到 <script> 标签中
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RRWeb 录像回放</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/rrweb-player@latest/dist/style.css" />
</head>
<body style="margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f2f5;">
  
  <div id="player"></div>

  <script src="https://cdn.jsdelivr.net/npm/rrweb-player@latest/dist/index.js"></script>
  
  <script>
    /* 注入录制的数据 */
    const events = ${JSON.stringify(events)};

    /* 初始化播放器 */
    new rrwebPlayer({
      target: document.getElementById('player'),
      props: {
        events: events,
        width: 1024, // 可以根据需要调整
        height: 576,
        autoPlay: true,
        showController: true,
      },
    });
  </script>
</body>
</html>
  `;
  
  // 2. 创建 Blob 并下载
  const blob = new Blob([htmlContent], {type: 'text/html'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `replay-${Date.now()}.html`; // 保存为 .html 文件
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};