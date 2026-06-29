# 测试数据生成器 - 功能设计文档

> 版本: v1.0
> 创建时间: 2024-01-20
> 状态: 已实现（见 `src/pages/TestDataGenerator/`、`src/lib/generators/`、`src/workers/generator.worker.ts`）

## 产品定位

**轻量级可视化测试数据生成器**

- 纯前端工具，无需后端
- 可视化配置，无需编码
- 本地生成，数据安全

## 目录

- [核心功能](./core-features.md)
- [生成器库](./generators.md)
- [规则管理](./rule-management.md)
- [界面设计](./ui-design.md)
- [技术实现](./technical-implementation.md)

## 当前实现入口

- 页面入口：`src/pages/TestDataGenerator/index.tsx`
- Worker：`src/workers/generator.worker.ts`
- 生成器库：`src/lib/generators/`
- 规则存储：`src/utils/ruleStorage.ts`
- 导出工具：`src/utils/dataExporter.ts`

实现约束与任务完成状态记录在 [TASKS.md](./TASKS.md)。

## 开发者注意事项（与源码同步）

以下行为以 `src/` 源码为准；设计文档中的旧版 class API、`metadata`/`options` 嵌套结构已废弃。

### Worker 任务 ID（`generationId`）

`useGenerator` 每次调用 `generate()` 递增 `generationIdRef`，经 `start` 消息传入 Worker。Worker 所有响应（`progress` / `complete` / `error`）均携带同一 `generationId`。

- **取消**：`cancel()` 先递增 ID 再发送 `cancel`，使进行中的 Worker 响应被主线程忽略；Worker 每生成 100 行让出事件循环以处理 cancel。
- **快速重试**：新任务 ID 大于旧响应时，旧消息被丢弃，避免 UI 状态错乱。

类型见 `WorkerRequestMessage` / `WorkerResponseMessage`（`src/types/testDataGenerator.ts`）。

### 规则存储写入失败

`ruleStorage.save()` / `update()` 在 `localStorage.setItem` 失败时返回 `null`（不部分提交）。页面层（如 `FieldList.tsx`）仅在返回值非空时 Toast 成功。详见 [rule-management.md § 存储机制](./rule-management.md#存储机制) 与 `src/utils/README.md`。
