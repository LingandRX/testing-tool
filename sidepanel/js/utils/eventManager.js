export class EventManager {
  constructor() {
    this.listeners = [];
  }

  add(ele, type, handler, options) {
    ele.addEventListener(type, handler, options);
    this.listeners.push({ele, type, handler, options});
  }

  remove(ele, type, handler, options) {
    ele.removeEventListener(type, handler, options);
    this.listeners = this.listeners.filter(
      (listener) =>
        listener.ele !== ele ||
        listener.type !== type ||
        listener.handler !== handler ||
        listener.options !== options
    );
  }

  removeAll() {
    return new Promise((resolve, reject) => {
      this.listeners.onload = () => {
        this.listeners.forEach((listener) => {
          listener.ele.removeEventListener(
            listener.type,
            listener.handler,
            listener.options
          );
        });
        resolve();
      };
      this.listeners.onerror = () => {
        console.error('unload event error');
        reject();
      };
      this.listeners = [];
    });
  }
}