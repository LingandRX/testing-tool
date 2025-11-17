# 开发指南

## 启动开发服务器（带热重载）

要启动带有热重载功能的开发服务器，请运行以下命令：

```bash
npm run dev
```

这将会：
1. 启动 Rollup 的监视模式
2. 自动重新编译更改的文件
3. 通过 LiveReload 刷新浏览器
4. 在 http://localhost:8082 启动开发服务器

## 项目结构

```
project/
├── sidepanel/           # Chrome扩展侧边栏面板
│   ├── index.html       # 侧边栏主页面
│   ├── index.js         # 侧边栏主脚本
│   ├── index.css        # 侧边栏样式
│   └── ...              # 其他相关文件
├── dist/                # 构建输出目录
└── ...                  # 其他配置和文档文件
```

## 预览方式

有两种方式可以预览您的更改：

1. 直接访问 `http://localhost:8082/sidepanel/index.html` 查看sidepanel的实际效果
2. 访问 `http://localhost:8082/index.html` 查看包含sidepanel预览的开发页面

## 构建生产版本

要构建生产版本，请运行：

```bash
npm run build
```

这将生成优化后的 bundle 文件到 `dist/sidepanel.bundle.js`。

## 热重载工作原理

- 当你修改 [sidepanel](file:///D:/Work/testing-tool/sidepanel) 目录下的任何文件时，Rollup 会自动重新编译
- 编译完成后，LiveReload 会自动刷新浏览器页面
- 无需手动刷新浏览器来查看更改效果