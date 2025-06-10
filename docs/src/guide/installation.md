# 安装

## 环境要求

在开始之前，请确保你的环境满足以下要求：

- Node.js 版本 >= 16.0.0
- 包管理工具：npm、yarn 或 pnpm（推荐使用 pnpm）
- Vite 版本 >= 3.1.0

## 安装 AIReview

### 使用 npm

```bash
npm install aireview -D
```

### 使用 yarn

```bash
yarn add aireview -D
```

### 使用 pnpm

```bash
pnpm install aireview -D
```

## 配置 Vite 插件

在你的 Vite 配置文件中添加 AIReview 插件：

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VueMcp } from 'aireview'

export default defineConfig({
  plugins: [
    vue(),
    VueMcp()
  ],
})
```

## 配置选项

AIReview 插件支持多种配置选项，以满足不同的需求：

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

## 与 Cursor 集成

如果你使用 Cursor 编辑器，AIReview 会自动更新 `.cursor/mcp.json` 文件（如果存在），以便 Cursor 能够连接到 MCP 服务器。

如果你需要手动创建此文件，可以在项目根目录下创建 `.cursor/mcp.json` 文件，内容如下：

```json
{
  "servers": [
    {
      "name": "vue-mcp",
      "url": "http://localhost:5173/__mcp/sse"
    }
  ]
}
```

## 验证安装

启动你的 Vite 开发服务器后，你应该能在控制台看到类似以下的输出：

```
[aireview] MCP server running at: http://localhost:5173/__mcp/sse
```

这表示 AIReview 已成功安装并运行。


