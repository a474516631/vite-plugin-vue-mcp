# AIReview VS Code Server

这是 AIReview 的 VS Code 服务器扩展，用于接收来自 vite 插件的请求，并在 VS Code 中执行 AI 编辑操作。

## 功能

- 提供 HTTP 服务器，接收来自 vite 插件的请求
- 支持 WebSocket 连接，实现实时通信
- 集成 Cursor AI 功能，执行代码编辑操作
- 自动在 VS Code 启动时启动服务器

## 配置项

在 VS Code 设置中可以配置以下选项：

- `@aireview/vscode-server.port`: 服务器端口号（默认: 3333）
- `@aireview/vscode-server.message`: 显示在通知中的消息

## 命令

此扩展提供以下命令：

- `@aireview/vscode-server.startServer`: 启动 AIReview 服务器
- `@aireview/vscode-server.stopServer`: 停止 AIReview 服务器
- `@aireview/vscode-server.helloWorld`: 显示欢迎消息

## API 接口

### HTTP 接口

#### 健康检查

```
GET /ping
```

响应：

```
pong
```

#### AI 编辑

```
POST /ai-edit
Content-Type: application/json

{
  "filePath": "/path/to/file.js",
  "prompt": "添加一个函数来计算两个数字的和"
}
```

响应：

```json
{
  "success": true,
  "message": "已成功使用Cursor AI执行编辑请求"
}
```

### WebSocket 接口

连接到 `ws://localhost:3333` 后，可以发送以下消息：

#### AI 编辑请求

```json
{
  "type": "ai-edit",
  "id": "unique-request-id",
  "filePath": "/path/to/file.js",
  "prompt": "添加一个函数来计算两个数字的和"
}
```

响应：

```json
{
  "type": "ai-edit-response",
  "id": "unique-request-id",
  "success": true,
  "message": "已成功使用Cursor AI执行编辑请求"
}
```

## 与 vite 插件集成

在 vite 插件中，可以通过以下方式连接到服务器：

```javascript
import axios from 'axios'

// 发送 HTTP 请求
async function sendAIEditRequest(filePath, prompt) {
  try {
    const response = await axios.post('http://localhost:3333/ai-edit', {
      filePath,
      prompt
    })
    return response.data
  }
  catch (error) {
    console.error('Error sending AI edit request:', error)
    return { success: false, error: error.message }
  }
}

// 或使用 WebSocket
function connectToVSCodeServer() {
  const ws = new WebSocket('ws://localhost:3333')

  ws.onopen = () => {
    console.log('Connected to VS Code server')
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    console.log('Received message:', data)
  }

  ws.onclose = () => {
    console.log('Disconnected from VS Code server')
  }

  return ws
}
```
