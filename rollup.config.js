import { defineConfig } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';

const basePlugins = [resolve(), commonjs(), json()];

const devPlugins = [
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
];

export default defineConfig([
  {
    input: 'sidepanel/js/index.js',
    output: {
      file: 'dist/index.js',
      format: 'iife',
      name: 'MainPage',
    },
    plugins: [...basePlugins, ...devPlugins],
  },

  {
    input: 'sidepanel/js/timestamp.js',
    output: {
      file: 'dist/timestamp.js',
      format: 'iife',
      name: 'TimestampPage',
    },
    plugins: [...basePlugins, ...devPlugins],
  },
]);
