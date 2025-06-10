# 高级用法

本页面介绍 AIReview 的高级用法和配置选项，帮助开发者充分利用 AIReview 的功能。

## 自定义 MCP 服务器

AIReview 允许你自定义 MCP 服务器的行为，以满足特定需求：

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VueMcp } from 'aireview'

export default defineConfig({
  plugins: [
    vue(),
    VueMcp({
      // 自定义 MCP 服务器设置
      mcpServerSetup: (server, viteServer) => {
        // 添加自定义工具
        server.addTool('custom-tool', async (params) => {
          // 实现自定义工具逻辑
          return { result: 'Custom tool result' }
        })
        
        // 你也可以返回一个新的 MCP 服务器来替换默认服务器
        return server
      }
    })
  ],
})
```

## 自定义工具实现

你可以实现自己的 MCP 工具，扩展 AIReview 的功能：

```ts
// 自定义工具示例
server.addTool('get-component-metrics', async (params) => {
  const { componentName } = params
  
  // 获取组件渲染性能指标
  const metrics = {
    renderTime: 10, // ms
    updateCount: 5,
    memoryUsage: 1024, // bytes
    // 其他指标...
  }
  
  return metrics
})
```

## 与其他 Vite 插件集成

AIReview 可以与其他 Vite 插件协同工作，例如与 `vite-plugin-inspect` 集成：

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VueMcp } from 'aireview'
import Inspect from 'vite-plugin-inspect'

export default defineConfig({
  plugins: [
    vue(),
    VueMcp(),
    Inspect()
  ],
})
```

## 非 HTML 入口项目配置

对于不使用 HTML 文件作为入口的项目，可以使用 `appendTo` 选项：

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VueMcp } from 'aireview'

export default defineConfig({
  plugins: [
    vue(),
    VueMcp({
      appendTo: /src\/main\.ts$/
    })
  ],
})
```

## 自定义 MCP 路径

你可以自定义 MCP 服务器的路径：

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VueMcp } from 'aireview'

export default defineConfig({
  plugins: [
    vue(),
    VueMcp({
      mcpPath: '/__custom_mcp'
    })
  ],
})
```

## 禁用 Cursor MCP 配置更新

如果你不希望 AIReview 自动更新 Cursor 的 MCP 配置，可以禁用此功能：

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VueMcp } from 'aireview'

export default defineConfig({
  plugins: [
    vue(),
    VueMcp({
      updateCursorMcpJson: false
    })
  ],
})
```

## 自定义 Cursor MCP 服务器名称

你可以自定义 Cursor MCP 配置中的服务器名称：

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VueMcp } from 'aireview'

export default defineConfig({
  plugins: [
    vue(),
    VueMcp({
      updateCursorMcpJson: {
        enabled: true,
        serverName: 'my-custom-vue-mcp'
      }
    })
  ],
})
```

## 性能优化

为了提高 AIReview 的性能，可以考虑以下几点：

1. **选择性启用工具**：只启用你需要的工具，减少不必要的资源消耗
2. **限制组件树深度**：在大型应用中，可以限制组件树的深度，减少数据量
3. **避免频繁状态更新**：频繁更新组件状态可能会导致性能问题，应适当控制更新频率

## 与 Vue DevTools 共存

AIReview 可以与 Vue DevTools 共存，两者提供互补的功能：

- Vue DevTools 提供可视化的调试界面
- AIReview 提供 MCP 服务器功能，支持 AI 工具集成

在开发过程中，你可以同时使用这两个工具，充分利用它们的优势。

## 故障排除

### MCP 服务器无法启动

可能的原因：
- 端口冲突
- Vite 服务器配置问题
- Node.js 版本不兼容

解决方案：
- 检查端口是否被占用
- 确认 Vite 配置是否正确
- 升级 Node.js 版本

### 组件树获取失败

可能的原因：
- Vue 应用尚未初始化
- 组件结构过于复杂
- 客户端代码注入失败

解决方案：
- 确保 Vue 应用已完全初始化
- 简化组件结构或限制树深度
- 检查客户端代码是否正确注入

### Cursor 无法连接到 MCP 服务器

可能的原因：
- MCP 配置文件未正确更新
- Cursor 版本不兼容
- 网络问题

解决方案：
- 手动更新 `.cursor/mcp.json` 文件
- 升级 Cursor 版本
- 检查网络连接 