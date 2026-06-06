# 测试数据生成器 - 实现任务列表

> 创建时间: 2026-06-06
> 状态: ✅ 已完成

## 总体进度

| 子功能                     | 状态      | 预估工时  |
| -------------------------- | --------- | --------- |
| 1. 类型定义与项目配置      | ✅ 已完成 | 0.5h      |
| 2. 生成器库                | ✅ 已完成 | 4h        |
| 3. Web Worker 数据生成引擎 | ✅ 已完成 | 2h        |
| 4. 规则存储与管理          | ✅ 已完成 | 2h        |
| 5. 数据导出功能            | ✅ 已完成 | 1h        |
| 6. UI 组件开发             | ✅ 已完成 | 6h        |
| 7. 页面集成与注册          | ✅ 已完成 | 1h        |
| 8. 测试与优化              | ✅ 已完成 | 2h        |
| **总计**                   |           | **18.5h** |

---

## 1. 类型定义与项目配置

**目标**: 创建所有必要的类型定义文件，配置项目注册新功能

### 任务清单

- [x] 1.1 创建 `src/types/testDataGenerator.ts` 类型定义文件
  - [x] 定义 `FieldConfig` 接口
  - [x] 定义 `DataRule` 接口
  - [x] 定义 `GeneratorDefinition` 接口
  - [x] 定义 `GeneratorParam` 接口
  - [x] 定义 `GenerateResult` 接口
  - [x] 定义 `ExportFile` 接口

- [x] 1.2 更新 `src/types/storage.d.ts`
  - [x] 在 `PageType` 中添加 `'testDataGenerator'`
  - [x] 在 `StorageSchema` 中添加测试数据生成器相关配置（如需要）

- [x] 1.3 更新 `src/config/features.tsx`
  - [x] 导入 TestDataGenerator 页面组件
  - [x] 添加新功能配置到 `FEATURES` 数组
  - [x] 选择合适的图标（如 `Database` 或 `FileSpreadsheet`）

- [x] 1.4 更新国际化配置
  - [x] 添加 `testDataGenerator_title` 翻译
  - [x] 添加 `testDataGenerator_description` 翻译

---

## 2. 生成器库

**目标**: 实现 21 个数据生成器，支持多种生成策略

### 任务清单

#### 2.1 生成器基础框架

- [x] 2.1.1 创建 `src/lib/generators/types.ts`
  - [x] 定义生成器内部类型（与 `testDataGenerator.ts` 分离）

- [x] 2.1.2 创建 `src/lib/generators/index.ts`
  - [x] 导出所有生成器
  - [x] 导出 `generatorCategories` 配置

#### 2.2 个人信息生成器 (6个)

- [x] 2.2.1 创建 `src/lib/generators/personal.ts`
  - [x] 实现 `chineseName` 生成器
    - [x] `generate()` 方法
    - [x] `generateAtIndex()` 方法
  - [x] 实现 `email` 生成器
    - [x] `generate()` 方法
    - [x] `generateAtIndex()` 方法
  - [x] 实现 `chinesePhone` 生成器
    - [x] `generate()` 方法
    - [x] `generateAtIndex()` 方法
  - [x] 实现 `idCard` 生成器
    - [x] `generate()` 方法
    - [x] `generateAtIndex()` 方法
  - [x] 实现 `chineseAddress` 生成器
    - [x] `generate()` 方法
    - [x] `generateAtIndex()` 方法
  - [x] 实现 `age` 生成器
    - [x] `generate()` 方法（支持 realistic/uniform/demographic 策略）
    - [x] `generateAtIndex()` 方法
    - [x] 实现 `normalRandom()` 辅助函数
    - [x] 实现 `demographicRandom()` 辅助函数

#### 2.3 业务数据生成器 (8个)

- [x] 2.3.1 创建 `src/lib/generators/business.ts`
  - [x] 实现 `orderId` 生成器
  - [x] 实现 `price` 生成器
    - [x] 实现 `generatePsychologicalPrice()` 辅助函数
    - [x] 实现 `generateRealisticPrice()` 辅助函数
  - [x] 实现 `date` 生成器
    - [x] 实现 `formatDate()` 辅助函数
  - [x] 实现 `status` 生成器
  - [x] 实现 `quantity` 生成器
    - [x] 实现 `poissonRandom()` 辅助函数
  - [x] 实现 `rating` 生成器
    - [x] 实现 `skewedRandom()` 辅助函数
  - [x] 实现 `discount` 生成器
    - [x] 实现 `generatePsychologicalDiscount()` 辅助函数
  - [x] 实现 `stock` 生成器
    - [x] 实现 `exponentialRandom()` 辅助函数

#### 2.4 技术数据生成器 (3个)

- [x] 2.4.1 创建 `src/lib/generators/technical.ts`
  - [x] 实现 `uuid` 生成器
  - [x] 实现 `ipv4` 生成器
  - [x] 实现 `url` 生成器

#### 2.5 基础类型生成器 (4个)

- [x] 2.5.1 创建 `src/lib/generators/basic.ts`
  - [x] 实现 `randomInt` 生成器
  - [x] 实现 `randomFloat` 生成器
  - [x] 实现 `randomString` 生成器
  - [x] 实现 `fromList` 生成器

---

## 3. Web Worker 数据生成引擎

**目标**: 实现后台数据生成，支持进度回调和取消

### 任务清单

- [x] 3.1 创建 `src/workers/generator.worker.ts`
  - [x] 实现 `self.onmessage` 处理器
  - [x] 验证生成器是否存在
  - [x] 实现数据生成循环
  - [x] 实现空值率控制逻辑
  - [x] 实现唯一性约束逻辑
    - [x] 小数据量：随机生成 + 重试（100次上限）
    - [x] 大数据量：索引生成策略
  - [x] 实现进度回调（每1000条）
  - [x] 实现完成回调（包含统计数据）
  - [x] 实现错误回调

- [x] 3.2 创建 `src/pages/TestDataGenerator/hooks/useGenerator.ts`
  - [x] 实现 Worker 创建和销毁
  - [x] 实现 `generate()` 方法
  - [x] 实现 `terminate()` 方法
  - [x] 管理进度状态
  - [x] 管理生成结果状态

---

## 4. 规则存储与管理

**目标**: 实现规则的持久化存储和管理功能

### 任务清单

- [x] 4.1 创建 `src/utils/ruleStorage.ts`
  - [x] 定义 `STORAGE_KEY` 常量
  - [x] 定义 `MAX_RULES = 20` 常量
  - [x] 实现 `getAll()` 方法
  - [x] 实现 `getById()` 方法
  - [x] 实现 `getCount()` 方法
  - [x] 实现 `isMaxReached()` 方法
  - [x] 实现 `save()` 方法（含数量限制检查）
  - [x] 实现 `update()` 方法
  - [x] 实现 `delete()` 方法
  - [x] 实现 `duplicate()` 方法
  - [x] 实现 `recordUse()` 方法
  - [x] 实现 `search()` 方法
  - [x] 实现 `getRecent()` 方法
  - [x] 实现 `export()` 方法
  - [x] 实现 `import()` 方法（含格式验证）
  - [x] 实现 `clear()` 方法
  - [x] 实现 `validateRule()` 私有方法

---

## 5. 数据导出功能

**目标**: 实现 JSON 和 CSV 格式的数据导出

### 任务清单

- [x] 5.1 创建 `src/utils/dataExporter.ts`
  - [x] 实现 `toJSON()` 静态方法
  - [x] 实现 `toCSV()` 静态方法
  - [x] 实现 `escapeCSV()` 私有方法
  - [x] 实现 `exportByFormat()` 静态方法
  - [x] 实现 `toMultipleFiles()` 静态方法
  - [x] 实现 `toSingleFile()` 静态方法
  - [x] 实现 `getMimeType()` 私有方法
  - [x] 实现 `download()` 静态方法
  - [x] 实现 `downloadMultiple()` 静态方法

---

## 6. UI 组件开发

**目标**: 实现所有界面组件，遵循视觉规范

### 任务清单

#### 6.1 页面组件

- [x] 6.1.1 创建 `src/pages/TestDataGenerator/index.tsx` 主页面
  - [x] 实现左右分栏布局（60% / 40%）
  - [x] 集成所有子组件
  - [x] 管理页面状态

#### 6.2 字段管理组件

- [x] 6.2.1 创建 `src/pages/TestDataGenerator/components/FieldList.tsx`
  - [x] 实现字段列表展示
  - [x] 实现添加字段按钮
  - [x] 实现字段拖拽排序（可选，使用上移/下移按钮）

- [x] 6.2.2 创建 `src/pages/TestDataGenerator/components/FieldItem.tsx`
  - [x] 实现单个字段项展示
  - [x] 实现字段名编辑
  - [x] 实现生成器切换下拉框
  - [x] 实现配置按钮
  - [x] 实现删除按钮
  - [x] 实现上移/下移按钮

- [x] 6.2.3 创建 `src/pages/TestDataGenerator/components/FieldEditor.tsx`
  - [x] 实现基础配置区（字段名、描述）
  - [x] 实现必填/选填切换
  - [x] 实现空值率配置（仅选填时显示）
    - [x] 滑块组件
    - [x] 预设按钮（低/中/高）
  - [x] 实现唯一性约束开关

#### 6.3 生成器相关组件

- [x] 6.3.1 创建 `src/pages/TestDataGenerator/components/GeneratorSelector.tsx`
  - [x] 实现分类展示（个人信息/业务数据/技术数据/基础类型）
  - [x] 实现搜索功能
  - [x] 实现生成器选择

- [x] 6.3.2 创建 `src/pages/TestDataGenerator/components/GeneratorConfig.tsx`
  - [x] 实现参数配置表单
  - [x] 支持不同参数类型（string/number/boolean/select/array）
  - [x] 实时预览更新

#### 6.4 数据预览组件

- [x] 6.4.1 创建 `src/pages/TestDataGenerator/components/DataPreview.tsx`
  - [x] 实现 JSON 格式预览
  - [x] 实现 CSV 格式预览
  - [x] 实现格式切换按钮
  - [x] 实现数据分页
  - [x] 实现复制功能

#### 6.5 生成选项组件

- [x] 6.5.1 创建 `src/pages/TestDataGenerator/components/GenerateOptions.tsx`
  - [x] 实现生成数量配置（预设 + 自定义）
  - [x] 实现数据格式选择（JSON/CSV）
  - [x] 实现默认空值率配置

- [x] 6.5.2 创建 `src/pages/TestDataGenerator/components/GenerateButton.tsx`
  - [x] 实现生成按钮
  - [x] 实现加载状态
  - [x] 实现进度条显示

#### 6.6 导出组件

- [x] 6.6.1 创建 `src/pages/TestDataGenerator/components/ExportPanel.tsx`
  - [x] 实现导出选项（复制/下载 JSON/下载 CSV）
  - [x] 实现下载逻辑

#### 6.7 结果展示组件

- [x] 6.7.1 创建 `src/pages/TestDataGenerator/components/ResultPanel.tsx`
  - [x] 实现成功状态展示
  - [x] 实现警告状态展示（部分字段失败）
  - [x] 实现错误状态展示
  - [x] 实现数据统计展示

#### 6.8 规则管理组件

- [x] 6.8.1 创建 `src/pages/TestDataGenerator/components/RuleManager.tsx`
  - [x] 实现规则列表展示
  - [x] 实现搜索功能
  - [x] 实现加载/编辑/删除/复制按钮
  - [x] 实现导入/导出功能
  - [x] 实现规则数量显示（已保存 X/20 条）

---

## 7. 页面集成与注册

**目标**: 将新功能集成到应用中

### 任务清单

- [x] 7.1 更新路由配置
  - [x] 确保 `RouterProvider` 支持新页面类型

- [x] 7.2 更新功能注册
  - [x] 验证 `features.tsx` 配置正确
  - [x] 验证图标显示正常

- [x] 7.3 更新仪表盘
  - [x] 在 Dashboard 中显示新工具卡片

---

## 8. 测试与优化

**目标**: 确保功能稳定性和性能

### 任务清单

#### 8.1 单元测试

- [x] 8.1.1 创建生成器测试
  - [x] `src/lib/generators/__tests__/personal.test.ts`
  - [x] `src/lib/generators/__tests__/business.test.ts`
  - [x] `src/lib/generators/__tests__/technical.test.ts`
  - [x] `src/lib/generators/__tests__/basic.test.ts`

- [x] 8.1.2 创建工具函数测试
  - [x] `src/utils/__tests__/ruleStorage.test.ts`
  - [x] `src/utils/__tests__/dataExporter.test.ts`

#### 8.2 集成测试

- [x] 8.2.1 创建页面测试
  - [x] `src/pages/TestDataGenerator/__tests__/TestDataGenerator.test.tsx`

#### 8.3 性能优化

- [x] 8.3.1 验证 Web Worker 性能
  - [x] 测试 10000+ 条数据生成
  - [x] 验证 UI 不阻塞

- [x] 8.3.2 验证内存使用
  - [x] 检查大数据量时的内存占用
  - [x] 确保无内存泄漏

#### 8.4 代码质量

- [x] 8.4.1 代码审查
  - [x] 遵循项目代码规范
  - [x] 遵循视觉规范文档

- [x] 8.4.2 文档更新
  - [x] 更新 AGENTS.md（如需要）

---

## 依赖关系

```
1. 类型定义与项目配置
    ↓
2. 生成器库
    ↓
3. Web Worker 数据生成引擎 (依赖 2)
    ↓
4. 规则存储与管理
    ↓
5. 数据导出功能
    ↓
6. UI 组件开发 (依赖 1, 2, 3, 4, 5)
    ↓
7. 页面集成与注册 (依赖 6)
    ↓
8. 测试与优化 (依赖 7)
```

---

## 注意事项

1. **遵循视觉规范**: 所有 UI 组件必须遵循 `docs/VISUAL_STYLE_GUIDE.md`
2. **使用现有组件**: 优先使用 `src/components/ui/` 中的 shadcn/ui 组件
3. **TypeScript 严格模式**: 确保类型安全
4. **错误处理**: 使用 `sonner` 库进行 Toast 提示
5. **性能考虑**: 大数据量生成必须使用 Web Worker
6. **响应式设计**: 支持桌面端、平板端、移动端
