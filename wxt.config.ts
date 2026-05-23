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
          if (
            id.includes('i18next') ||
            id.includes('react-i18next') ||
            id.includes('intl-messageformat')
          ) {
            return 'vendor-i18n';
          }
          // 二维码活态感知依赖分流
          if (id.includes('qr-scanner') || id.includes('qrious')) {
            return 'vendor-qr';
          }
          // 拖拽排序高级组件分流
          if (id.includes('@dnd-kit')) {
            return 'vendor-dnd';
          }
          // Markdown 高性能转换引擎分流
          if (id.includes('marked')) {
            return 'vendor-markdown';
          }

          return undefined;
        },
      };
    },
  };
}

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Testing Tool',
    description: 'A tool for testing web applications.',
    version_name: undefined,
    permissions: [
      'storage',
      'unlimitedStorage',
      'clipboardWrite',
      'activeTab',
      'scripting',
      'tabs',
      'cookies',
      'sidePanel',
      'contextMenus',
      'alarms',
    ],
    host_permissions: ['<all_urls>'],
    action: {
      default_title: '__MSG_extName__',
    },
    side_panel: {
      default_path: 'entrypoints/sidepanel/index.html',
    },
    options_ui: {
      page: 'entrypoints/options/index.html',
      open_in_tab: true,
    },
  },
  vite: () => ({
    plugins: [manualChunksForHtmlOnly()],
    build: {
      minify: 'terser',
      terserOptions: {
        format: { ascii_only: true, comments: false },
      },
      chunkSizeWarningLimit: 800,
    },
  }),
});
