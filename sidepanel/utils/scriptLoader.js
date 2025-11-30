let currentScript = null;
export function loadScript(path, globalInitName) {
  console.log('load script', currentScript);

  if (currentScript) {
    console.log('remove script')
    currentScript.remove();
    currentScript = null;
  }

  if (globalInitName && window[globalInitName]) {
    delete window[globalInitName];
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = path;
    script.type = 'module';

    script.onload = () => {
      currentScript = document.querySelector(`script[src='${path}']`);
      console.log('script loaded', currentScript);
      resolve();
    };

    script.onerror = reject;

    document.body.appendChild(script);
  });
}
