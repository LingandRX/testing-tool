const POPOVER_ID = 'testing-tools-popover';
const POPOVER_STYLE_ID = 'testing-tools-popover-style';

function injectStyles(): void {
  if (document.getElementById(POPOVER_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = POPOVER_STYLE_ID;
  style.textContent = `
    #${POPOVER_ID} {
      position: fixed;
      z-index: 2147483647;
      max-width: 400px;
      min-width: 200px;
      padding: 12px 16px;
      background: #1a1a2e;
      color: #e0e0e0;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      line-height: 1.5;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-8px);
      transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
      pointer-events: none;
    }

    #${POPOVER_ID}.visible {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
      pointer-events: auto;
    }

    #${POPOVER_ID} .popover-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    #${POPOVER_ID} .popover-title {
      font-weight: 600;
      font-size: 12px;
      color: #a0a0b0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    #${POPOVER_ID} .popover-close {
      background: none;
      border: none;
      color: #808090;
      cursor: pointer;
      padding: 2px;
      font-size: 16px;
      line-height: 1;
    }

    #${POPOVER_ID} .popover-close:hover {
      color: #e0e0e0;
    }

    #${POPOVER_ID} .popover-content {
      word-break: break-all;
      white-space: pre-wrap;
    }

    #${POPOVER_ID} .popover-label {
      color: #808090;
      font-size: 11px;
      margin-bottom: 4px;
    }

    #${POPOVER_ID} .popover-value {
      color: #ffffff;
      font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
      font-size: 14px;
      padding: 6px 8px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
      margin-bottom: 8px;
    }

    #${POPOVER_ID} .stat-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 4px;
    }

    #${POPOVER_ID} .stat-item {
      padding: 6px 8px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
    }

    #${POPOVER_ID} .stat-label {
      font-size: 11px;
      color: #808090;
    }

    #${POPOVER_ID} .stat-value {
      font-size: 16px;
      font-weight: 600;
      color: #ffffff;
    }
  `;
  document.head.appendChild(style);
}

function getOrCreatePopover(): HTMLElement {
  let popover = document.getElementById(POPOVER_ID);
  if (!popover) {
    injectStyles();
    popover = document.createElement('div');
    popover.id = POPOVER_ID;
    document.body.appendChild(popover);
  }
  return popover;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function positionPopover(popover: HTMLElement, x: number, y: number): void {
  // 此时借助 visibility: hidden，元素在隐藏状态下拥有真实的布局高宽
  const rect = popover.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = x + 8; // 微微追加水平偏置，防范直接遮挡用户的鼠标落点
  let top = y + 8;

  if (left + rect.width > viewportWidth - 16) {
    left = viewportWidth - rect.width - 16;
  }
  if (left < 16) left = 16;

  if (top + rect.height > viewportHeight - 16) {
    top = y - rect.height - 8;
  }
  if (top < 16) top = 16;

  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
}

let hideTimeout: ReturnType<typeof setTimeout> | null = null;

export function showPopover(
  x: number,
  y: number,
  contentHtml: string,
  title?: string,
  duration: number = 5000,
): void {
  const popover = getOrCreatePopover();

  popover.innerHTML = '';

  if (title) {
    const header = document.createElement('div');
    header.className = 'popover-header';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'popover-title';
    titleSpan.textContent = title; // ✅ 强安全性护航

    const closeBtn = document.createElement('button');
    closeBtn.className = 'popover-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
      popover.classList.remove('visible');
    });

    header.appendChild(titleSpan);
    header.appendChild(closeBtn);
    popover.appendChild(header);
  }

  const contentContainer = document.createElement('div');
  contentContainer.className = 'popover-content';
  contentContainer.innerHTML = contentHtml; // 内部拼装的方法已提前完成全消毒转义
  popover.appendChild(contentContainer);

  // 提前移除激活类名，使 visibility: hidden 起效以供测量
  popover.classList.remove('visible');

  requestAnimationFrame(() => {
    positionPopover(popover, x, y);
    popover.classList.add('visible');
  });

  if (hideTimeout) clearTimeout(hideTimeout);

  if (duration > 0) {
    hideTimeout = setTimeout(() => {
      hidePopover();
    }, duration);
  }
}

export function hidePopover(): void {
  const popover = document.getElementById(POPOVER_ID);
  if (popover) {
    popover.classList.remove('visible');
  }
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
}

export function showTimestampResult(x: number, y: number, timestamp: string, result: string): void {
  // 对外部传来的参数先全数塞入 escapeHtml 大闸进行纯氧化清洗
  const cleanTimestamp = escapeHtml(timestamp);
  const cleanResult = escapeHtml(result);

  const content = `
    <div class="popover-label">输入时间戳</div>
    <div class="popover-value">${cleanTimestamp}</div>
    <div class="popover-label">转换结果</div>
    <div class="popover-value">${cleanResult}</div>
  `;
  showPopover(x, y, content, '⏰ 时间戳转换');
}

export function showTextStatsResult(
  x: number,
  y: number,
  text: string,
  stats: { characters: number; words: number; lines: number; bytes: number },
): void {
  const truncatedText = text.length > 50 ? text.substring(0, 50) + '...' : text;
  // 对选中的脏文本先进行严格转义
  const cleanText = escapeHtml(truncatedText);

  const content = `
    <div class="popover-label">选中文本</div>
    <div class="popover-value">${cleanText}</div>
    <div class="stat-grid">
      <div class="stat-item">
        <div class="stat-label">字符</div>
        <div class="stat-value">${stats.characters}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">单词</div>
        <div class="stat-value">${stats.words}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">行数</div>
        <div class="stat-value">${stats.lines}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">字节</div>
        <div class="stat-value">${stats.bytes}</div>
      </div>
    </div>
  `;
  showPopover(x, y, content, '📊 文本统计');
}
