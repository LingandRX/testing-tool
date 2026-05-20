import { defineConfig } from 'wxt';
import type { Plugin } from 'vite';

/**
 * 仅在 HTML 多入口构建（popup / options / sidepanel）中启用 manualChunks 拆分 vendor。
 * WXT 对 background / content-script 使用 lib 模式（IIFE），该模式不支持 manualChunks。
 */
function manualChunksForHtmlOnly(): Plugin {
  return {
    name: 'manual-chunks-html-only',
    outputOptions(rawOptions) {
      // lib 模式（IIFE）不支持 manualChunks，仅对 ES/CJS 格式启用
      if (rawOptions.format === 'iife' || rawOptions.format === 'umd') {
        return;
      }
      rawOptions.manualChunks = (id: string) => {
        if (!id.includes('node_modules')) return;

        // React 核心
        if (id.includes('/react-dom/') || (id.includes('/react/') && !id.includes('/react-dom/'))) {
          return 'vendor-react';
        }
        // MUI + Emotion
        if (
          id.includes('@mui/') ||
          id.includes('@emotion/') ||
          id.includes('hoist-non-react-statics') ||
          id.includes('csstype') ||
          id.includes('@popperjs/')
        ) {
          return 'vendor-mui';
        }
        // 国际化
        if (
          id.includes('i18next') ||
          id.includes('react-i18next') ||
          id.includes('intl-messageformat')
        ) {
          return 'vendor-i18n';
        }
        // QR 相关
        if (id.includes('qr-scanner') || id.includes('qrious')) {
          return 'vendor-qr';
        }
        // 拖拽
        if (id.includes('@dnd-kit')) {
          return 'vendor-dnd';
        }
        // Markdown
        if (id.includes('marked')) {
          return 'vendor-markdown';
        }
      };
    },
  };
}

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
      'cookies',
      'sidePanel',
      'contextMenus',
    ],
    host_permissions: ['<all_urls>'],
    action: {
      default_title: 'Testing Tools',
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
      chunkSizeWarningLimit: 600,
    },
  }),
});
