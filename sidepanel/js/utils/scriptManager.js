export class ScriptManager {
  constructor() {
    this._loadedClasses = new Map();
    this.currentScriptEl = null;
    this.currentModule = null;
    this.currentName = null;
  }

  async loadScript({path, name, isModule = false, deps = []}) {
    console.log('loadScript', name);
    if (this._loadedClasses.has(name)) {
      console.log(`Component ${name} loaded from cache`);
    }

    console.log('deps', deps);
    for (const dep of deps) {
      await this._appendScript({path: dep, isModule: false});
    }

    let componentReference = null;

    console.log(`isModule:${isModule}`);
    if (isModule) {
      const module = await import(path);
      this.currentModule = module;
      componentReference = module;
    } else {
      await this._appendScript({path, isModule: false});
      componentReference = window[name] || null;
    }

    if (componentReference) {
      this._loadedClasses.set(name, componentReference);
    }

    this.currentName = name;
    return componentReference;
  }

  async _appendScript({path, isModule}) {
    const s = document.createElement('script');
    s.src = path;
    s.type = isModule ? 'module' : 'text/javascript';
    s.async = false;

    return new Promise((resolve, reject) => {
      s.onload = () => {
        this.currentScriptEl = s;
        console.log(s);
        resolve();
      };
      s.onerror = () => {
        reject(new Error(`Failed to load script: ${path}`));
      }
      document.body.appendChild(s);
    });
  }

  async unloadScript() {
    console.log('unloadScript');
    if (this.currentScriptEl) {
      try {
        this.currentScriptEl.remove();
      } catch (e) {
        console.error(e);
      }
    }

    this.currentModule = null;
    this.currentName = null;
    this.currentScriptEl = null;
  }

  async getComponentInstance(name) {
    const ComponentClassReference = this._loadedClasses.get(name);
    const BaseClassForCheck = window.BaseComponent;

    if (!ComponentClassReference) {
      console.error('ComponentClassReference not found');
      return null
    }

    const ComponentClass = ComponentClassReference.default
      || ComponentClassReference;

    if (typeof ComponentClass === 'function') {
      if (!(ComponentClass.prototype instanceof BaseClassForCheck)) {
        console.error(`Component ${name} does not inherit BaseComponent.`);
        return null;
      }

      return new ComponentClass();
    }

    console.error(`Component ${name} does not exist`);
    return null;
  }
}
