# 功能特性

AIReview 提供了一系列强大的功能，帮助开发者更好地理解和调试 Vue 应用。本页面将详细介绍这些功能及其使用方法。

## 组件树可视化

`get-component-tree` 工具可以获取 Vue 应用的组件树结构，帮助开发者了解应用的组件层次关系。

![组件树](../../public/component-tree.gif)

### 使用方法

```ts
// 通过 MCP 客户端获取组件树
const componentTree = await mcpClient.runTool('get-component-tree')
```

### 返回数据结构

```ts
interface ComponentTreeNode {
  id: string
  name: string
  filename?: string
  children: ComponentTreeNode[]
  // 其他组件信息...
}
```

## 组件状态查看

`get-component-state` 工具可以获取指定组件的状态数据，包括 props、data、computed 等。

![组件状态](../../public/component-state.gif)

### 使用方法

```ts
// 通过 MCP 客户端获取组件状态
const componentState = await mcpClient.runTool('get-component-state', {
  componentName: 'App' // 组件名称
})
```

### 参数说明

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| componentName | string | 要查看状态的组件名称 |

## 组件状态编辑

`edit-component-state` 工具可以编辑指定组件的状态数据，修改将实时反映在应用中。

![编辑组件状态](../../public/edit-component-state.gif)

### 使用方法

```ts
// 通过 MCP 客户端编辑组件状态
await mcpClient.runTool('edit-component-state', {
  componentName: 'Counter', // 组件名称
  path: 'count', // 状态路径
  value: 100, // 新值
  valueType: 'number' // 值类型
})
```

### 参数说明

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| componentName | string | 要编辑状态的组件名称 |
| path | string | 状态路径，如 'count' 或 'user.name' |
| value | any | 新的状态值 |
| valueType | string | 值的类型，如 'string'、'number'、'boolean' 等 |

## 组件高亮

`highlight-component` 工具可以在应用中高亮显示指定的组件，帮助开发者快速定位 UI 元素对应的代码。

![高亮组件](../../public/highlight-component.gif)

### 使用方法

```ts
// 通过 MCP 客户端高亮组件
await mcpClient.runTool('highlight-component', {
  componentName: 'Header' // 组件名称
})
```

### 参数说明

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| componentName | string | 要高亮的组件名称 |

## 路由信息获取

`get-router-info` 工具可以获取 Vue Router 的路由信息，包括路由配置、当前路由等。

![路由信息](../../public/router-info.gif)

### 使用方法

```ts
// 通过 MCP 客户端获取路由信息
const routerInfo = await mcpClient.runTool('get-router-info')
```

### 返回数据结构

```ts
interface RouterInfo {
  routes: RouteRecordNormalized[]
  currentRoute: RouteLocationNormalizedLoaded
}
```

## Pinia 树获取

`get-pinia-tree` 工具可以获取应用中所有 Pinia 存储的树状结构。

![Pinia 树](../../public/pinia-tree.gif)

### 使用方法

```ts
// 通过 MCP 客户端获取 Pinia 树
const piniaTree = await mcpClient.runTool('get-pinia-tree')
```

### 返回数据结构

```ts
interface PiniaStoreInfo {
  id: string
  name: string
}
```

## Pinia 状态获取

`get-pinia-state` 工具可以获取指定 Pinia 存储的状态数据。

![Pinia 状态](../../public/pinia-state.gif)

### 使用方法

```ts
// 通过 MCP 客户端获取 Pinia 状态
const piniaState = await mcpClient.runTool('get-pinia-state', {
  storeName: 'counter' // 存储名称
})
```

### 参数说明

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| storeName | string | 要获取状态的 Pinia 存储名称 |

## AI 编辑支持

AIReview 通过 VSCode 扩展和 Vite 插件的通信，支持在浏览器中直接触发 AI 编辑功能，修复问题。

### 工作流程

1. 在浏览器中发现问题
2. 通过 AIReview 工具获取相关组件和状态信息
3. 触发 AI 编辑功能
4. AI 分析问题并提供修复方案
5. 应用修复并实时查看效果

## 与 Cursor 集成

AIReview 与 Cursor 编辑器集成，提供更强大的开发体验：

1. 自动更新 `.cursor/mcp.json` 文件
2. 通过 Cursor AI 助手直接与 Vue 应用交互
3. 获取组件树、状态和路由信息
4. 使用自然语言描述进行组件状态编辑

## 最佳实践

- 在开发模式下使用 AIReview，生产环境不建议启用
- 使用组件高亮功能快速定位 UI 元素对应的组件
- 结合组件状态编辑功能进行快速原型验证
- 使用 Pinia 状态管理功能调试复杂状态逻辑
- 结合 Cursor AI 助手，使用自然语言进行应用调试 