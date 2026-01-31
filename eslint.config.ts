import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import * as reactHooks from 'eslint-plugin-react-hooks';
import * as reactPlugin from 'eslint-plugin-react';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist', '.wxt', 'node_modules', 'eslint.config.ts'] },

  {
    files: [
      'hooks/**/*.{ts,tsx}',
      'entrypoints/**/*.{ts,tsx}',
      'pages/**/*.{ts,tsx}',
      'utils/**/*.{ts,tsx}',
      'components/**/*.{ts,tsx}',
      'services/**/*.{ts,tsx}',
    ],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react: reactPlugin as any, // 现在这里就算写 TS 语法也没事了，因为文件被忽略了
      'react-hooks': reactHooks as any,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'react/react-in-jsx-scope': 'off',
    },
  },
);
