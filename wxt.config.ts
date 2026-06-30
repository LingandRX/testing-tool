import { defineConfig } from 'wxt';
import type { Plugin } from 'vite';

function manualChunksForHtmlOnly(): Plugin {
  return {
    name: 'manual-chunks-html-only',
    outputOptions(rawOptions) {
      if (rawOptions.format === 'iife' || rawOptions.format === 'umd') {
        return;
      }

      return {
        ...rawOptions,
        manualChunks(id: string): string | void {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (
            id.includes('/react-dom/') ||
            (id.includes('/react/') && !id.includes('/react-dom/'))
          ) {
            return 'vendor-react';
          }

          // qrious / qr-scanner / @dnd-kit 不单独拆 vendor chunk：
          // 独立 vendor 会与 Vite preload 辅助函数共 chunk，被 App Shell 静态拉取。
          // 这些依赖随各自页面 async chunk 加载即可。

          return undefined;
        },
      };
    },
  };
}

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  manifest: {
    name: 'Testing Tool',
    description: 'A tool for testing web applications.',
    version_name: undefined,
    permissions: [
      'storage',
      'clipboardWrite',
      'scripting',
      'tabs',
      'cookies',
      'sidePanel',
      'contextMenus',
    ],
    host_permissions: ['<all_urls>'],
    icons: {
      '16': 'icon/16.png',
      '32': 'icon/32.png',
      '48': 'icon/48.png',
      '96': 'icon/96.png',
      '128': 'icon/128.png',
    },
    action: {
      default_title: 'Testing Tool',
      default_icon: {
        '16': 'icon/16.png',
        '32': 'icon/32.png',
        '48': 'icon/48.png',
      },
    },
    side_panel: {
      default_path: 'entrypoints/sidepanel/index.html',
    },
  },
  vite: () => ({
    plugins: [manualChunksForHtmlOnly()],
    build: {
      modulePreload: false,
      minify: 'terser',
      terserOptions: {
        format: { ascii_only: true, comments: false },
      },
      chunkSizeWarningLimit: 800,
    },
  }),
});
