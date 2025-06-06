# @aireview/vite-plugin

Vite 插件部分，用于帮助模型更好地理解您的 Vue 应用。

## 功能

- MCP 服务器集成
- Vue 组件点击跳转源码
- UI 走查功能
- AI 编辑支持

## 安装

```bash
npm install aireview
```

## 使用

```js
import Vue from '@vitejs/plugin-vue'
import VueMcp from 'aireview'
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    Vue(),
    VueMcp(),
  ],
})
```

## 配置选项

请参考主包文档。

## 使用 AI 编辑功能

### 前端调用

```js
// 在浏览器控制台或前端代码中调用
window.VueMcpAI.edit({
  prompt: '将按钮颜色改为蓝色',
  filePath: 'src/components/Button.vue' // 可选
}).then((result) => {
  console.log('AI编辑结果:', result)
})

// 或者使用 UI 评审 JSON 文件
window.VueMcpAI.edit({
  aiReviewJsonPath: '.ui-review/ui-review.json'
}).then((result) => {
  console.log('AI编辑结果:', result)
})
```

### 在 Vue 组件中使用

```vue
<script>
export default {
  methods: {
    async handleAIEdit() {
      if (!window.VueMcpAI) {
        console.error('VueMcpAI 未加载，请确保 vite-plugin-vue-mcp 已正确配置')
        return
      }

      try {
        const result = await window.VueMcpAI.edit({
          prompt: '优化这个组件的性能',
          filePath: 'src/components/CurrentComponent.vue'
        })

        if (result.success) {
          console.log('AI编辑请求已发送')
        }
        else {
          console.error('AI编辑请求失败:', result.error)
        }
      }
      catch (error) {
        console.error('发送AI编辑请求时出错:', error)
      }
    }
  }
}
</script>

<template>
  <div>
    <button @click="handleAIEdit">
      使用AI修复问题
    </button>
  </div>
</template>
```

## 与 VSCode 插件集成

此插件可以与 VSCode 插件集成，实现以下功能：

1. 从浏览器发送 AI 编辑请求到 VSCode
2. 在 VSCode 中使用 Cursor AI 处理编辑请求
3. 自动修复 UI 问题

要使用此功能，请确保：

1. 安装了 VSCode 插件 `vite-plugin-vue-mcp-vscode`
2. VSCode 插件已启动（默认端口 5011）
3. 使用 Cursor 编辑器或已安装 Cursor AI 扩展
