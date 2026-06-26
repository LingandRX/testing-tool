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
