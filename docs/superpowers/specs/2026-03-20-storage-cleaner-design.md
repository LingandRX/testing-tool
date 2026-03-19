# 存储清理功能设计文档

## 概述

为浏览器扩展添加一个存储清理功能，允许用户快速清理当前页面的各种存储数据，包括 localStorage、sessionStorage、IndexedDB、Cookies、Cache Storage 和 Service Workers。

## 目标

- 提供便捷的页面存储清理功能
- 支持多种存储类型清理
- 提供清理结果反馈
- 支持清理后自动刷新页面

## 架构设计

### 组件结构

```
entrypoints/popup/pages/
├── TimestampPage.tsx        (现有：时间戳转换页面)
└── StorageCleanerPage.tsx    (新增：存储清理页面)
```

### 页面布局

在弹窗中添加标签页切换功能，用户可以在时间戳转换和存储清理之间切换。

**路由实现方案：**

使用简单的状态管理进行页面切换：

```typescript
// App.tsx
type PageType = 'timestamp' | 'storageCleaner';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('timestamp');

  return (
    <div className="app">
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button
          variant={currentPage === 'timestamp' ? 'contained' : 'outlined'}
          onClick={() => setCurrentPage('timestamp')}
        >
          时间戳
        </Button>
        <Button
          variant={currentPage === 'storageCleaner' ? 'contained' : 'outlined'}
          onClick={() => setCurrentPage('storageCleaner')}
          sx={{ ml: 1 }}
        >
          存储清理
        </Button>
      </Box>
      {currentPage === 'timestamp' && <TimestampPage />}
      {currentPage === 'storageCleaner' && <StorageCleanerPage />}
    </div>
  );
}
```

## 用户界面设计

### 页面组成

1. **头部区域**
   - 标题："存储清理"
   - 当前域名显示（自动从活动标签页获取）

2. **存储类型选择区域**
   - 勾选框：localStorage
   - 勾选框：sessionStorage
   - 勾选框：IndexedDB
   - 勾选框：Cookies
   - 勾选框：Cache Storage
   - 勾选框：Service Workers

3. **自动刷新选项**
   - 复选框：清理完成后自动刷新页面（默认勾选）

4. **操作区域**
   - 清理按钮

5. **结果显示区域**
   - 清理成功/失败提示
   - 清理详情统计（如："清理了 5 个 localStorage, 3 个 cookies"）
   - 刷新页面按钮（当未勾选自动刷新时显示）

## 技术实现细节

### 获取当前标签页域名

使用 Chrome Tabs API 获取当前活动标签页，并过滤受限页面：

```typescript
const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

// 检查受限页面
const restrictedProtocols = ['chrome:', 'chrome-extension:', 'about:', 'edge:', 'view-source:'];

if (!tab?.url || restrictedProtocols.some((p) => tab.url!.startsWith(p))) {
  throw new Error('存储清理功能不支持此页面');
}

const domain = new URL(tab.url).hostname;
```

### 清理 Cookies（使用 chrome.cookies API）

在扩展环境中直接执行，不需要注入页面：

```typescript
const cookies = await chrome.cookies.getAll({ url: tab.url });
let count = 0;
for (const cookie of cookies) {
  await chrome.cookies.remove({
    url: tab.url,
    name: cookie.name,
    storeId: cookie.storeId,
  });
  count++;
}
```

### 注入脚本清理其他存储

使用 `chrome.scripting.executeScript` 注入清理脚本：

```typescript
const result = await chrome.scripting.executeScript({
  target: { tabId: tab.id },
  func: () => {
    // 清理逻辑在页面上下文中执行
  },
});
```

需要注入到页面执行的存储清理逻辑：

#### 清理 localStorage

```javascript
const count = localStorage.length;
localStorage.clear();
return count;
```

#### 清理 sessionStorage

```javascript
const count = sessionStorage.length;
sessionStorage.clear();
return count;
```

#### 清理 IndexedDB

```javascript
// 检查 databases indexedDB 方法是否可用
if (typeof indexedDB.databases === 'function') {
  const databases = await indexedDB.databases();
  let count = 0;
  for (const db of databases) {
    const deleteReq = indexedDB.databases(db.name);
    deleteReq.onblocked = () => {
      console.warn('IndexedDB delete blocked:', db.name);
    };
    await new Promise((resolve, reject) => {
      deleteReq.onsuccess = resolve;
      deleteReq.onerror = reject;
    });
    count++;
  }
  return count;
}
// 降级方案：使用传统方法
let count = 0;
// 尝试遍历已知数据库或提示用户手动清除
return count;
```

#### 清理 Cache Storage

```javascript
if ('caches' in window) {
  const cacheNames = await caches.keys();
  for (const name of cacheNames) {
    await caches.delete(name);
  }
  return cacheNames.length;
}
return 0;
```

#### 注销 Service Workers

```javascript
if ('serviceWorker' in navigator) {
  const registrations = await navigator.serviceWorker.getRegistrations();
  let count = 0;
  for (const registration of registrations) {
    await registration.unregister();
    count++;
  }
  return count;
}
return 0;
```

### 数据流

1. 页面加载时获取当前标签页 URL 并显示域名
2. 检查是否为受限页面（chrome://, about:// 等），如果是则显示错误提示
3. 用户勾选要清理的存储类型
4. 用户选择是否自动刷新页面
5. 用户点击清理按钮
6. 弹出确认对话框询问用户确认
7. 确认后执行清理：
   - 如果选择 Cookies：直接使用 chrome.cookies API 删除
   - 其他存储类型：向页面注入清理脚本
8. 收集所有清理结果并统计
9. 显示清理结果
10. 如果勾选"自动刷新"或用户点击"刷新页面"按钮，执行页面刷新

**注意：** 当触发页面刷新时，popup 会自动关闭。需要在刷新前显示提示信息。

### 页面刷新

```typescript
await chrome.tabs.reload(tab.id);
```

## 错误处理

| 错误场景                        | 处理方式                                 |
| ------------------------------- | ---------------------------------------- |
| 无法获取当前标签页              | 显示错误提示："无法获取当前标签页"       |
| 受限页面（chrome://, about://） | 显示错误提示："存储清理功能不支持此页面" |
| 无法访问页面 URL                | 显示错误提示："无法访问此页面"           |
| IndexedDB onblocked             | 显示警告但继续执行其他清理               |
| IndexedDB.databases 不可用      | 使用降级方案或提示用户手动清除           |
| 清理失败                        | 显示具体错误信息                         |
| Cookies 删除失败                | 记录错误，显示清理失败提示               |
| 无权限                          | 提示用户刷新扩展或检查权限               |
| 脚本注入失败                    | 显示错误提示："无法注入清理脚本"         |

**Popup 生命周期说明：**

- Popup 在页面失去焦点时会关闭
- 刷新页面后 Popup 会自动关闭
- 需要在刷新前显示提示："页面即将刷新，Popup 将关闭"

**Popup 生命周期说明：**

- Popup 在页面失去焦点时会关闭
- 刷新页面后 Popup 会自动关闭
- 需要在刷新前显示提示："页面即将刷新，Popup 将关闭"

## 权限需求

需要在 manifest 中添加 `cookies` 权限：

```typescript
permissions: [
  'storage',
  'unlimitedStorage',
  'clipboardWrite',
  'activeTab',
  'scripting',
  'tabs',
  'debugger',
  'cookies', // 新增
],
```

## TypeScript 类型定义

在现有 `types/storage.d.ts` 中添加存储清理相关的类型：

```typescript
export interface StorageCleanerOptions {
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
  cookies: boolean;
  cacheStorage: boolean;
  serviceWorkers: boolean;
}

export type StorageCleanResult =
  | {
      success: true;
      count: number;
    }
  | {
      success: false;
      error: string;
    };

export interface CleaningResult {
  success: boolean;
  error?: string;
  localStorage?: StorageCleanResult;
  sessionStorage?: StorageCleanResult;
  indexedDB?: StorageCleanResult;
  cookies?: StorageCleanResult;
  cacheStorage?: StorageCleanResult;
  serviceWorkers?: StorageCleanResult;
}
```

## 测试计划

1. 测试各种存储类型的单独清理
2. 测试同时清理多种存储类型
3. 测试自动刷新功能
4. 测试手动刷新按钮
5. 测试无存储数据时的清理
6. 测试无法访问页面的错误处理
7. 测试 IndexedDB onblocked 场景
8. 测试 httponly 和 secure cookies 清理

## 后续优化

- 显示清理前的存储使用情况
- 支持批量清理多个标签页
- 支持自定义域名清理
