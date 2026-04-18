export default {
  // 对于代码文件：
  '*.{ts,tsx,js,jsx,mjs}': [
    // 1. ESLint: 检查并自动修复
    // --no-warn-ignored: 抑制对忽略文件的警告（eslint.config.ts 中忽略了测试文件）
    'eslint --fix --max-warnings=0 --no-warn-ignored',

    // 2. TypeScript: 类型检查
    () => 'tsc --noEmit',
  ],

  // 对于其他文件：
  '*.{json,css,scss,md}': ['prettier --write'],
};