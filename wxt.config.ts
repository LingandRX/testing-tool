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
      'offscreen',
    ],
    host_permissions: ['<all_urls>'],
    action: {
      default_title: 'Testing Tools',
    },
    // 注意：WXT 会根据 entrypoints/options/index.html 自动生成 options_ui 的 page 路径
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
});
