# 快速开始

## 概述

AIReview 是一个专为 Vue 应用设计的智能 UI 走查工具，以 Vite 插件形式提供。它能自动识别 UI 问题、提供修复建议，并生成详细的走查报告，帮助团队显著提升 UI 质量和走查效率。本指南将帮助你快速上手 AIReview。

## 安装

使用你喜欢的包管理器安装 AIReview：

```bash
# 使用 npm
npm install aireview -D

# 使用 yarn
yarn add aireview -D

# 使用 pnpm
pnpm install aireview -D
```

## 基本配置

在你的 Vite 配置文件中添加 AIReview 插件：

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AiReviewVitePlugin from 'aireview'

export default defineConfig({
  plugins: [
    vue(),
    AiReviewVitePlugin({
        appendTo: 'src/main.ts',
        enableClickToComponent: true, // 启用点击定位组件功能
        uiReviewSave: {
          enabled: true,
          directory: '.ui-review', // UI走查结果保存目录
          autoSaveInterval: 0, // 收到数据时立即保存
        },
        // 高级走查配置
        uiReviewOptions: {
          autoDetect: true, // 启用自动问题检测
          screenshotOnMark: true, // 标记问题时自动截图
          generateReport: true, // 自动生成走查报告
        }
      }),
    ],
})
```

## 启动项目

启动你的 Vite 开发服务器：

```bash
# 使用 npm
npm run dev

# 使用 yarn
yarn dev

# 使用 pnpm
pnpm dev
```

启动后，AIReview 将在控制台输出服务信息，并自动注入 UI 走查工具到你的应用中。

## 使用 UI 走查功能

### 1. 进入走查模式

在浏览器中打开你的应用后，按下 `Ctrl+Shift+A`（Mac 上为 `Cmd+Shift+A`）激活 UI 走查面板。

### 2. 识别和标记问题

- **自动检测**：系统会自动识别并高亮可能存在问题的 UI 元素
- **手动标记**：点击任意元素并使用走查面板添加问题描述
- **问题分类**：选择问题类型（布局问题、样式异常、交互缺陷等）
- **添加注释**：为每个问题添加详细描述和修复建议

### 3. 组件定位与修复

- 点击任意 UI 元素，系统会显示对应组件的源码位置
- 使用智能修复建议快速解决常见问题
- 一键跳转到编辑器中的精确代码位置

### 4. 生成走查报告

- 完成走查后，点击"生成报告"按钮
- 系统会自动汇总所有问题，生成结构化报告
- 报告包含问题分类统计、详细列表和修复建议

## 走查最佳实践

- 在多个设备和屏幕尺寸下进行走查，确保响应式设计正常
- 结合团队协作，指派不同成员关注不同类型的 UI 问题
- 定期进行 UI 走查，并比较历史报告，跟踪改进进度
- 将 UI 走查整合到开发流程中，作为提交代码前的必要步骤

## 下一步

- 查看[配置选项](/guide/installation#配置选项)了解更多配置细节
- 了解 AIReview 的[走查功能详解](/guide/features/ui-review)
- 探索[高级问题检测设置](/guide/advanced/detection-rules)
