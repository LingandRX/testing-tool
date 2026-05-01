import { FormMapEntry } from '@/types/storage';
import { FuzzyMatcher } from './smartInjector';
import { SmartDetector } from './scanner';

/**
 * 可视化交互模块：负责在网页上绘制非破坏性的高亮遮罩
 */
export class VisualHighlighter {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isVisible = false;
  private currentEntries: FormMapEntry[] = [];
  private hoveredElement: HTMLElement | null = null;
  private animationFrameId: number | null = null;
  private flashTimer: number | null = null;
  private isVisibleBeforeFlash = false;
  private entriesToRestore: FormMapEntry[] = [];

  // 监听器引用，用于清理
  private currentPickerCallback: ((el: HTMLElement) => void) | null = null;
  private clickListener: ((e: MouseEvent) => void) | null = null;

  constructor() {
    this.handleResize = this.handleResize.bind(this);
    this.render = this.render.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  public init() {
    // 如果已经存在且在 DOM 中，无需重复初始化
    if (this.canvas && document.body.contains(this.canvas)) return;

    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'form-mapping-highlighter';
    }

    Object.assign(this.canvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
    });

    // 使用 setProperty 确保优先级覆盖网页 CSS
    this.canvas.style.setProperty('z-index', '2147483647', 'important');
    this.canvas.style.setProperty('display', this.isVisible ? 'block' : 'none', 'important');

    // pointer-events 初始值处理（如果是拾取模式应该保持 auto）
    const isPickingMode = this.canvas.style.cursor === 'crosshair';
    this.canvas.style.setProperty('pointer-events', isPickingMode ? 'auto' : 'none', 'important');

    if (!document.body.contains(this.canvas)) {
      document.body.appendChild(this.canvas);
    }
    this.ctx = this.canvas.getContext('2d');

    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('scroll', this.handleResize);
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('scroll', this.handleResize);
  }

  public show() {
    this.isVisible = true;
    this.init();
    if (this.canvas) {
      this.canvas.style.setProperty('display', 'block', 'important');
    }
    this.requestUpdate();
  }

  public hide() {
    this.isVisible = false;
    this.hoveredElement = null;
    if (this.canvas) {
      this.canvas.style.setProperty('display', 'none', 'important');
      this.canvas.style.setProperty('pointer-events', 'none', 'important');
    }
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private handleResize() {
    if (!this.isVisible || !this.canvas || !this.ctx) return;
    this.requestUpdate();
  }

  private handleMouseMove(e: MouseEvent) {
    if (!this.isVisible || !this.canvas) return;

    // 探测当前鼠标下的元素
    // 暂时设为 none 以便探测下方真实 DOM
    this.canvas.style.setProperty('pointer-events', 'none', 'important');
    let el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
    // 恢复为 auto 允许接收点击
    this.canvas.style.setProperty('pointer-events', 'auto', 'important');

    if (el) {
      el = SmartDetector.findRealTarget(el);
    }

    if (el !== this.hoveredElement) {
      this.hoveredElement = el;
      this.requestUpdate();
    }
  }

  private ensureCanvasInDOM() {
    if (!this.canvas || !document.body.contains(this.canvas)) {
      this.init();
    }
  }

  /**
   * 核心更新请求，使用 requestAnimationFrame 节流
   */
  private requestUpdate() {
    if (this.animationFrameId !== null) return;
    this.animationFrameId = requestAnimationFrame(this.render);
  }

  /**
   * 绘制带圆角的矩形（兼容性实现）
   */
  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;

    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }

  /**
   * 核心渲染逻辑
   */
  private render() {
    this.animationFrameId = null;
    if (!this.isVisible) return;

    try {
      this.ensureCanvasInDOM();
      if (!this.ctx || !this.canvas) return;

      // 适配分辨率
      if (this.canvas.width !== window.innerWidth || this.canvas.height !== window.innerHeight) {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
      }

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      const isFlashing = this.flashTimer !== null;

      // 1. 绘制已有的映射字段
      this.currentEntries.forEach((entry) => {
        try {
          const match = FuzzyMatcher.findTargetElement(entry.fingerprint);
          const el = match.element;
          if (!el) return;

          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;

          const useProminentStyle = isFlashing || entry.ui_state.is_selected;
          this.drawHighlight(rect, entry.label_display || '未识别', useProminentStyle);
        } catch {
          // 单个元素匹配失败不影响整体渲染
        }
      });

      // 2. 绘制当前悬停预览 (如果处于拾取模式)
      const isPicking = this.canvas.style.cursor === 'crosshair';
      if (this.hoveredElement && isPicking) {
        const rect = this.hoveredElement.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          this.drawHighlight(rect, '准备拾取...', true, '#00BFFF'); // 亮蓝色预览
        }
      }
    } catch (error) {
      console.error('Highlighter render loop error:', error);
    }
  }

  /**
   * 绘制单项高亮
   */
  private drawHighlight(rect: DOMRect, label: string, isProminent: boolean, customColor?: string) {
    if (!this.ctx) return;
    const ctx = this.ctx;

    const mainColor = customColor || (isProminent ? '#FFD700' : 'rgba(128, 128, 128, 0.5)');
    const bgColor = customColor
      ? `${customColor}40`
      : isProminent
        ? 'rgba(255, 215, 0, 0.25)'
        : 'rgba(128, 128, 128, 0.1)';

    // 绘制外框
    ctx.beginPath();
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = isProminent ? 3 : 1;
    ctx.fillStyle = bgColor;
    this.drawRoundedRect(rect.left, rect.top, rect.width, rect.height, 4);
    ctx.fill();
    ctx.stroke();

    // 绘制标签背景
    ctx.font = 'bold 12px sans-serif';
    const textWidth = ctx.measureText(label).width;
    const labelHeight = 20;
    const labelX = rect.left;
    const labelY = rect.top - labelHeight - 2;

    if (labelY > 0) {
      // 确保标签在视口内
      ctx.fillStyle = mainColor;
      ctx.beginPath();
      this.drawRoundedRect(labelX, labelY, textWidth + 10, labelHeight, 2);
      ctx.fill();

      // 绘制标签文字
      ctx.fillStyle = '#000';
      ctx.fillText(label, labelX + 5, labelY + 14);
    }
  }

  /**
   * 公共 draw 方法，仅更新数据并触发渲染请求
   */
  public draw(entries: FormMapEntry[] = []) {
    const deepCopied = JSON.parse(JSON.stringify(entries));
    if (this.flashTimer) {
      this.entriesToRestore = deepCopied;
      return;
    }

    this.currentEntries = deepCopied;
    if (this.isVisible) {
      this.requestUpdate();
    }
  }

  /**
   * 闪烁高亮指定的条目
   */
  public flash(entries: FormMapEntry[], duration: number = 3000) {
    if (this.flashTimer) {
      window.clearTimeout(this.flashTimer);
    } else {
      this.isVisibleBeforeFlash = this.isVisible;
      this.entriesToRestore = JSON.parse(JSON.stringify(this.currentEntries));
    }

    this.currentEntries = JSON.parse(JSON.stringify(entries));
    this.show();

    this.flashTimer = window.setTimeout(() => {
      this.flashTimer = null;
      if (!this.isVisibleBeforeFlash) {
        this.hide();
        this.currentEntries = [];
      } else {
        this.currentEntries = this.entriesToRestore;
      }
      this.requestUpdate();
    }, duration);
  }

  /**
   * 开启拾取模式：拦截点击事件 (支持连续拾取)
   */
  public enablePicker(onPick: (element: HTMLElement) => void) {
    if (!this.canvas) this.init();

    // 清理旧的监听器防止多重绑定
    this.disablePicker();

    this.currentPickerCallback = onPick;

    // 强制开启交互
    this.canvas!.style.setProperty('pointer-events', 'auto', 'important');
    this.canvas!.style.setProperty('cursor', 'crosshair', 'important');

    this.canvas!.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas!.addEventListener('mousemove', this.handleMouseMove);

    this.clickListener = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // 穿透 canvas 寻找下方元素
      if (this.canvas) {
        this.canvas.style.setProperty('pointer-events', 'none', 'important');
        const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
        this.canvas.style.setProperty('pointer-events', 'auto', 'important');

        if (el && this.currentPickerCallback) {
          this.currentPickerCallback(SmartDetector.findRealTarget(el));
        }
      }
    };

    // 使用 capture 确保优先拦截，不使用 once: true 以支持连续拾取
    this.canvas!.addEventListener('click', this.clickListener, { capture: true });
  }

  public disablePicker() {
    if (this.canvas) {
      this.canvas.style.setProperty('pointer-events', 'none', 'important');
      this.canvas.style.setProperty('cursor', 'default', 'important');
      this.canvas.removeEventListener('mousemove', this.handleMouseMove);

      if (this.clickListener) {
        this.canvas.removeEventListener('click', this.clickListener, { capture: true });
        this.clickListener = null;
      }

      this.currentPickerCallback = null;
      this.hoveredElement = null;
      this.requestUpdate();
    }
  }
}

export const highlighter = new VisualHighlighter();
