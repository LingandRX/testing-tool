import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactPlugin from 'eslint-plugin-react';
import globals from 'globals';

export default tseslint.config(
  // 1. 全局物理隔离：彻底掐灭对构建产物与配置本身的干扰
  {
    ignores: ['dist', '.output', '.wxt', 'node_modules', 'eslint.config.ts', 'eslint.config.js'],
  },

  // 2. 注入 JavaScript 与 TypeScript 的官方大师级推荐规则集
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 3. 针对测试文件专属沙箱：解耦强类型死锁，放行 any，容忍未消费变量
  {
    files: ['**/__tests__/**', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', 'setupTests.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // 4. 核心业务全受控大管线（Hooks, Entrypoints, Components 统一护航）
  {
    files: [
      'hooks/**/*.{ts,tsx}',
      'entrypoints/**/*.{ts,tsx}',
      'pages/**/*.{ts,tsx}',
      'utils/**/*.{ts,tsx}',
      'components/**/*.{ts,tsx}',
      'services/**/*.{ts,tsx}',
    ],
    ignores: ['**/__tests__/**', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],

    languageOptions: {
      ecmaVersion: 2022, // 💡 升级至现代高频语法解析
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      // 💡 修复点 1（史诗级治愈）：废除脆弱的 project 硬编码路径！
      // 拥抱 typescript-eslint 官方推荐的 projectService 常驻动态类型调度中枢。
      // 它会在内存中全自动、流式为所有新建、悬空或暂存文件分配编译上下文，
      // 彻底终结 "file is not included in any tsconfig" 的全量崩溃黑洞！
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    // 挂载插件沙箱
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
    },

    // 💡 修复点 2：高精对齐 React 19 / JSX Runtime 的全量生产质检规则大闸
    rules: {
      // 激活 react-hooks 官方推荐规则
      ...reactHooks.configs.recommended.rules,
      // 激活 react 官方精选规则（排除旧版 React 必须手动 import 的历史包袱）
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,

      // 清洗原生未消费变量冲突，统一交由 TS 高阶哨兵接管
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // 彻底关闭老旧的 JSX 作用域检查，全面契合 React 19 核心美学
      'react/react-in-jsx-scope': 'off',
    },
  },
);
