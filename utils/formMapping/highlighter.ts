import { FormMapEntry } from '@/types/storage';

/**
 * 可视化交互模块：负责在网页上绘制非破坏性的高亮遮罩
 */
export class VisualHighlighter {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isVisible = false;
  private currentEntries: FormMapEntry[] = [];
  private animationFrameId: number | null = null;

  constructor() {
    this.handleResize = this.handleResize.bind(this);
    this.render = this.render.bind(this);
  }

  public init() {
    if (this.canvas) return;
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'form-mapping-highlighter';
    Object.assign(this.canvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: '2147483647',
      display: 'none',
    });
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    window.addEventListener('resize', this.handleResize);
    window.addEventListener('scroll', this.handleResize);
  }

  public show() {
    if (!this.canvas) this.init();
    this.isVisible = true;
    this.canvas!.style.display = 'block';
    this.requestUpdate();
  }

  public hide() {
    this.isVisible = false;
    if (this.canvas) this.canvas.style.display = 'none';
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private handleResize() {
    if (!this.isVisible || !this.canvas || !this.ctx) return;
    this.requestUpdate();
  }

  /**
   * 核心更新请求，使用 requestAnimationFrame 节流
   */
  private requestUpdate() {
    if (this.animationFrameId !== null) return;
    this.animationFrameId = requestAnimationFrame(this.render);
  }

  /**
   * 核心渲染逻辑
   */
  private render() {
    this.animationFrameId = null;
    if (!this.ctx || !this.isVisible || !this.canvas) return;

    // 适配分辨率
    if (this.canvas.width !== window.innerWidth || this.canvas.height !== window.innerHeight) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.currentEntries.forEach((entry) => {
      const el = document.querySelector<HTMLElement>(entry.fingerprint.selector);
      if (!el) return;

      const rect = el.getBoundingClientRect();

      // 检查元素是否在视口内
      if (
        rect.bottom < 0 ||
        rect.top > window.innerHeight ||
        rect.right < 0 ||
        rect.left > window.innerWidth
      ) {
        return;
      }

      // 设置样式
      if (entry.ui_state.is_selected) {
        // 选中状态：亮黄色边框
        this.ctx!.strokeStyle = '#FFD700';
        this.ctx!.lineWidth = 3;
        this.ctx!.fillStyle = 'rgba(255, 215, 0, 0.2)';
      } else {
        // 未选中状态：浅蓝色半透明
        this.ctx!.strokeStyle = 'rgba(173, 216, 230, 0.8)';
        this.ctx!.lineWidth = 1;
        this.ctx!.fillStyle = 'rgba(173, 216, 230, 0.4)';
      }

      // 绘制矩形
      this.ctx!.beginPath();
      this.ctx!.rect(rect.left, rect.top, rect.width, rect.height);
      this.ctx!.fill();
      this.ctx!.stroke();

      // 如果被选中，绘制一个小标签
      if (entry.ui_state.is_selected) {
        this.ctx!.fillStyle = '#FFD700';
        this.ctx!.font = '12px sans-serif';
        this.ctx!.fillText(entry.label_display, rect.left, rect.top - 5);
      }
    });
  }

  /**
   * 公共 draw 方法，仅更新数据并触发渲染请求
   */
  public draw(entries: FormMapEntry[] = []) {
    this.currentEntries = entries;
    if (this.isVisible) {
      this.requestUpdate();
    }
  }

  /**
   * 开启拾取模式：拦截点击事件
   */
  public enablePicker(onPick: (element: HTMLElement) => void) {
    if (!this.canvas) this.init();
    this.canvas!.style.pointerEvents = 'auto';
    this.canvas!.style.cursor = 'crosshair';

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // 暂时禁用 canvas pointer-events 以便探测下方的真实元素
      this.canvas!.style.pointerEvents = 'none';
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
      this.canvas!.style.pointerEvents = 'auto';

      if (el) {
        onPick(el);
      }
    };

    this.canvas!.addEventListener('click', handleClick, { capture: true, once: true });
  }

  public disablePicker() {
    if (this.canvas) {
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.cursor = 'default';
    }
  }
}

export const highlighter = new VisualHighlighter();
