# CI/CD 配置

## CI 步骤

严格顺序，任一步骤失败则停止并标记 CI 失败：

1. `setup`（安装依赖、`wxt prepare`）
2. 并行运行 `lint`、`typecheck`、`test`（三者全部通过才继续）
3. `build`（仅当步骤 2 全部成功时执行）

## Pre-commit Hook

`.husky/pre-commit` 调用 `lint-staged`，任一步骤返回非零则终止提交：

1. 代码文件 (`*.{ts,tsx,js,jsx,mjs}`)：运行 `eslint --fix --max-warnings=0 --no-warn-ignored`；若失败则终止并报告错误
2. 同一代码文件：运行 `prettier --write`
3. 其他文件 (`*.{json,css,scss,md}`)：运行 `prettier --write`
