export default {
  // 对于代码文件：
  '*.{ts,tsx,js,jsx}': [
    // 1. ESLint: 依然检查具体文件，拦截未使用变量
    'eslint --fix --max-warnings=0 --no-warn-ignored',

    // 2. TypeScript: 使用函数形式
    // 关键！这就告诉 lint-staged：“不要把文件名传给 tsc，直接运行这个命令就好”
    // 这样 tsc 就会去读取 tsconfig.json，并正确排除 eslint.config.ts
    () => 'tsc --noEmit --skipLibCheck',
  ],

  // 对于其他文件：
  '*.{json,css,scss,md}': ['prettier --write'],
};
