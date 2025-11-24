import { defineConfig } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';

export default defineConfig({
  input: 'sidepanel/js/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
  },
  plugins: [
    resolve(),
    commonjs(),
    json(),
    livereload({
      watch: ['dist', 'sidepanel'],
      verbose: false,
    }),
    serve({
      open: true,
      port: 8082,
      contentBase: ['.', 'sidepanel'],
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }),
  ],
  watch: {
    include: ['sidepanel/**/*'],
    exclude: ['node_modules/**/*'],
    clearScreen: false,
  },
});
