import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()] as any,
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.wxt', 'dist', 'build'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.wxt/',
        'dist/',
        'build/',
        '**/*.d.ts',
        'vitest.setup.ts',
        'vitest.config.ts',
      ],
    },
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
});