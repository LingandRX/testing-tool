export class TimerManager {
  constructor() {
    // 定时器对象数组
    this.timers = [];
  }

  /**
   * 添加定时器到数组中
   * @param {*} fn
   * @param {*} delay
   * @param  {...any} args
   * @returns
   */
  setTimeout(fn, delay, ...args) {
    const id = window.setTimeout(fn, delay, ...args);
    this.timers.push(id);
    return id;
  }

  /**
   * 添加定时器到数组中
   * @param {*} fn
   * @param {*} delay
   * @param  {...any} args
   * @returns
   */
  setInterval(fn, delay, ...args) {
    const id = window.setInterval(fn, delay, ...args);
    this.timers.push(id);
    return id;
  }

  /**
   * 清除定时器
   * @param {*} id
   */
  clearTimeout(id) {
    window.clearTimeout(id);
    this.timers = this.timers.filter((timerId) => timerId !== id);
  }

  clearInterval(id) {
    window.clearInterval(id);
    this.timers = this.timers.filter((timerId) => timerId !== id);
  }

  cleanAll() {
    return new Promise((resolve, reject) => {
      this.timers.onload = () => {
        this.timers.forEach((timerId) => {
          window.clearTimeout(timerId);
          window.clearInterval(timerId);
        });
        resolve();
      };
      this.timers.onerror = () => {
        console.log('unload timer error');
        reject();
      }
      this.timers = [];
    });
  }
}
