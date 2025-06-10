# API 参考

本页面提供 AIReview 的 API 参考文档，包括配置选项、工具 API 和类型定义。

## 配置选项

### VueMcpOptions

`VueMcpOptions` 是 AIReview 插件的主要配置接口：

```ts
export interface VueMcpOptions {
  /**
   * 服务器监听的主机名，默认为 `localhost`
   */
  host?: string

  /**
   * 是否在控制台打印 MCP 服务器 URL
   * @default true
   */
  printUrl?: boolean

  /**
   * MCP 服务器信息，当提供 `mcpServer` 时忽略
   */
  mcpServerInfo?: McpServerInfo

  /**
   * 自定义 MCP 服务器，当提供此选项时，内置的 MCP 工具将被忽略
   */
  mcpServer?: (viteServer: ViteDevServer) => Awaitable<McpServer>

  /**
   * 设置 MCP 服务器，在 MCP 服务器创建时调用
   * 你也可以返回一个新的 MCP 服务器来替换默认服务器
   */
  mcpServerSetup?: (server: McpServer, viteServer: ViteDevServer) => Awaitable<void | McpServer>

  /**
   * MCP 服务器路径，默认为 `/__mcp`
   */
  mcpPath?: string

  /**
   * 是否更新 Cursor 配置文件 `.cursor/mcp.json` 中的 MCP 服务器地址
   * 仅当 `.cursor` 文件夹存在时生效
   * @default true
   */
  updateCursorMcpJson?: boolean | {
    enabled: boolean
    /**
     * MCP 服务器名称，默认为 `vue-mcp`
     */
    serverName?: string
  }

  /**
   * 将导入附加到以 `appendTo` 结尾的模块 ID，而不是将脚本添加到 body 中
   * 对于不使用 HTML 文件作为入口的项目很有用
   * 
   * 警告：仅在你确切知道它的作用时设置此选项
   * @default ''
   */
  appendTo?: string | RegExp
}
```

## MCP 工具 API

### get-component-tree

获取 Vue 组件树结构。

**参数**：无

**返回值**：

```ts
interface ComponentTreeNode {
  id: string
  name: string
  filename?: string
  children: ComponentTreeNode[]
  // 其他组件信息...
}
```

**示例**：

```ts
const componentTree = await mcpClient.runTool('get-component-tree')
```

### get-component-state

获取指定组件的状态数据。

**参数**：

```ts
interface GetComponentStateParams {
  componentName: string
}
```

**返回值**：

```ts
interface ComponentState {
  props: Record<string, any>
  data: Record<string, any>
  computed: Record<string, any>
  // 其他状态信息...
}
```

**示例**：

```ts
const componentState = await mcpClient.runTool('get-component-state', {
  componentName: 'App'
})
```

### edit-component-state

编辑指定组件的状态数据。

**参数**：

```ts
interface EditComponentStateParams {
  componentName: string
  path: string
  value: any
  valueType: string
}
```

**返回值**：

```ts
interface EditComponentStateResult {
  success: boolean
  message?: string
}
```

**示例**：

```ts
const result = await mcpClient.runTool('edit-component-state', {
  componentName: 'Counter',
  path: 'count',
  value: 100,
  valueType: 'number'
})
```

### highlight-component

在应用中高亮显示指定的组件。

**参数**：

```ts
interface HighlightComponentParams {
  componentName: string
}
```

**返回值**：

```ts
interface HighlightComponentResult {
  success: boolean
  message?: string
}
```

**示例**：

```ts
const result = await mcpClient.runTool('highlight-component', {
  componentName: 'Header'
})
```

### get-router-info

获取 Vue Router 的路由信息。

**参数**：无

**返回值**：

```ts
interface RouterInfo {
  routes: RouteRecordNormalized[]
  currentRoute: RouteLocationNormalizedLoaded
}
```

**示例**：

```ts
const routerInfo = await mcpClient.runTool('get-router-info')
```

### get-pinia-tree

获取应用中所有 Pinia 存储的树状结构。

**参数**：无

**返回值**：

```ts
interface PiniaTreeResult {
  stores: PiniaStoreInfo[]
}

interface PiniaStoreInfo {
  id: string
  name: string
}
```

**示例**：

```ts
const piniaTree = await mcpClient.runTool('get-pinia-tree')
```

### get-pinia-state

获取指定 Pinia 存储的状态数据。

**参数**：

```ts
interface GetPiniaStateParams {
  storeName: string
}
```

**返回值**：

```ts
interface PiniaState {
  state: Record<string, any>
  getters: Record<string, any>
}
```

**示例**：

```ts
const piniaState = await mcpClient.runTool('get-pinia-state', {
  storeName: 'counter'
})
```

## MCP 服务器 API

### McpServer

`McpServer` 是 MCP 服务器的主要接口：

```ts
interface McpServer {
  /**
   * 添加 MCP 工具
   */
  addTool: (name: string, handler: ToolHandler) => void

  /**
   * 获取所有已注册的工具
   */
  getTools: () => Record<string, ToolHandler>

  /**
   * 运行指定的工具
   */
  runTool: (name: string, params?: any) => Promise<any>

  /**
   * 关闭 MCP 服务器
   */
  close: () => Promise<void>
}
```

### ToolHandler

`ToolHandler` 是 MCP 工具处理函数的类型：

```ts
type ToolHandler = (params: any) => Promise<any>
```

## 类型定义

### McpServerInfo

`McpServerInfo` 包含 MCP 服务器的基本信息：

```ts
interface McpServerInfo {
  /**
   * MCP 服务器名称
   */
  name: string

  /**
   * MCP 服务器 URL
   */
  url: string

  /**
   * MCP 服务器描述
   */
  description?: string
}
```

### Awaitable

`Awaitable` 是一个辅助类型，表示可能是异步的值：

```ts
type Awaitable<T> = T | Promise<T>
```

## 扩展 MCP 服务器

你可以通过 `mcpServerSetup` 选项扩展 MCP 服务器的功能：

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VueMcp } from 'aireview'

export default defineConfig({
  plugins: [
    vue(),
    VueMcp({
      mcpServerSetup: (server, viteServer) => {
        // 添加自定义工具
        server.addTool('custom-tool', async (params) => {
          // 实现自定义工具逻辑
          return { result: 'Custom tool result' }
        })
      }
    })
  ],
})
```

## 客户端 API

AIReview 客户端 API 可以在浏览器中使用，用于与 MCP 服务器交互：

```ts
// 获取 MCP 客户端实例
const mcpClient = window.__MCP_CLIENT__

// 运行 MCP 工具
const result = await mcpClient.runTool('get-component-tree')

// 获取可用工具列表
const tools = mcpClient.getTools()
```

## 与 VSCode 扩展集成

AIReview 提供了与 VSCode 扩展集成的 API，支持在浏览器中触发 AI 编辑功能：

```ts
// 触发 AI 编辑功能
await mcpClient.runTool('trigger-ai-edit', {
  componentName: 'Counter',
  issue: '计数器按钮点击后没有响应'
})
```

这将通过 VSCode 扩展与 AI 助手交互，分析问题并提供修复方案。
