export class ScriptManager {
  constructor() {
    this.currentScriptEl = null;
    this.currentModule = null;
    this.currentName = null;
  }

  async loadScript({ path, name, isModule = false, deps = [] }) {
    console.log('loadScript');
    console.log({ path, name, isModule, deps })
    await this.unloadScript();

    for (const dep of deps) {
      await this._appendScript({ path: dep, isModule: false });
    }

    if (isModule) {
      const absPath = (path = '?t' + Date.now());
      this.currentModule = await import(absPath);
      this.currentScriptEl = null;
      this.currentName = name;
      return this.currentModule;
    } else {
      await this._appendScript({ path, isModule: false });
      this.currentName = name;
      return window[name] || null;
    }
  }

  async _appendScript({ path, isModule }) {
    const s = document.createElement('script');
    try {
      s.src = path + '?t=' + Date.now();
      s.type = isModule ? 'module' : 'text/javascript';
      s.async = false;
      s.onload = () => {
        this.currentScriptEl = s;
      };
    } catch (e) {
      throw new Error(`Failed to load script: ${path}`);
    } finally {
      document.body.appendChild(s);
    }
  }

  async unloadScript() {
    console.log('unloadScript');
    try {
      if (this.currentName && window[this.currentName]) {
        const mod = window[this.currentName];
        const unName = this._findUnmountName(mod);
        if (unName && typeof mod[unName] === 'function') {
          await mod[unName]();
        }
      }

      if (this.currentModule) {
        const mod = this.currentModule;
        const unName = this._findUnmountName(mod);
        if (unName && typeof mod[unName] === 'function') {
          await mod[unName]();
        }
      }
    } catch (e) {
      console.error(e);
    }

    if (this.currentScriptEl) {
      try {
        this.currentScriptEl.remove();
      } catch (e) {
        console.error(e);
      }
    }
    this.currentModule = null;
    this.currentName = null;
  }

  _findInitName(obj) {
    if (!obj) return null;
    const candidates = ['init', 'start', 'main'];
    for (const c of candidates) {
      if (typeof obj[c] === 'function') {
        return c;
      }
    }
    return null;
  }

  _findUnmountName(obj) {
    if (!obj) return null;
    const candidates = ['unmount', 'stop', 'destroy'];
    for (const c of candidates) {
      if (typeof obj[c] === 'function') {
        return c;
      }
    }
    return null;
  }

  async runInit(name) {
    if (this.currentModule) {
      const mod = this.currentModule;
      const init = this._findInitName(mod);
      if (init) return mod[init]();
      return null;
    } else if (name && window[name]) {
      const mod = window[name];
      const init = this._findInitName(mod);
      if (init) return mod[init]();
    }

    return null;
  }
}
