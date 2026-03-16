import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    cache: {
      dir: resolve(__dirname, '.vitest'),
    },
    tsconfig: './tsconfig.vitest.json',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
});
