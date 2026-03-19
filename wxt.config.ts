import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Testing Tools',
    version: '1.0',
    description: '测试工具',
    permissions: [
      'storage',
      'unlimitedStorage',
      'clipboardWrite',
      'activeTab',
      'scripting',
      'tabs',
      'debugger',
      'cookies',
    ],
    host_permissions: ['<all_urls>'],
    action: {
      default_title: 'Testing Tools',
    },
    options_ui: {
      open_in_tab: true,
    },
    // 将 favicon.ico 放入 public/ 文件夹中
    icons: {
      16: 'favicon.ico',
      48: 'favicon.ico',
      128: 'favicon.ico',
    },
  },
  vite: () => ({
    build: {
      // 1. 切换压缩器为 terser
      minify: 'terser',

      // 2. 配置 terser 强制转义所有非 ASCII 字符
      terserOptions: {
        format: {
          ascii_only: true,
          comments: false,
        },
      },
    },
  }),
});
