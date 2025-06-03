import type { Awaitable } from '@antfu/utils'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { Implementation as McpServerInfo } from '@modelcontextprotocol/sdk/types.js'
import type { BirpcGroupReturn } from 'birpc'
import type { Hookable } from 'hookable'
import type { AIEditRequest, AIEditResult } from './rpc'

// 使用any类型代替ViteDevServer
type ViteDevServer = any

export interface RpcFunctions {
  // components
  getInspectorTree: (options: { event: string, componentName?: string }) => void
  onInspectorTreeUpdated: (event: string, data: string) => void
  getInspectorState: (options: { event: string, componentName: string }) => void
  onInspectorStateUpdated: (event: string, data: string) => void
  editComponentState: (options: { componentName: string, path: string[], value: string, valueType: string }) => void
  highlightComponent: (options: { componentName: string }) => void
  // router
  getRouterInfo: (options: { event: string }) => void
  onRouterInfoUpdated: (event: string, data: string) => void
  // pinia
  getPiniaState: (options: { event: string, storeName: string }) => void
  onPiniaInfoUpdated: (event: string, data: string) => void
  getPiniaTree: (options: { event: string }) => void
  onPiniaTreeUpdated: (event: string, data: string) => void
  // ui review elements
  sendUIReviewElements: (elements: UIReviewElement[]) => void
  onUIReviewElementsUpdated: (event: string, data: string) => void
  // get ui review elements
  getUIReviewElements: (options: { event: string }) => void
  // AI编辑功能
  handleAIEdit: (request: AIEditRequest) => Promise<AIEditResult>
  onAIEditResult: (event: string, data: string) => void
}

// UI评审元素接口定义
export interface UIReviewElement {
  name: string
  path: string
  type?: string
  comment?: string
  screenshot?: string
  /** 是否已提交 */
  isSubmitted?: boolean
  /** 是否已修复 */
  isFixed?: boolean
}

export interface VueMcpContext {
  hooks: Hookable
  rpc: RpcFunctions
  rpcServer: BirpcGroupReturn<RpcFunctions>
}
export interface VueMcpOptions {
  /**
   * The host to listen on, default is `localhost`
   */
  host?: string

  /**
   * Print the MCP server URL in the console
   *
   * @default true
   */
  printUrl?: boolean

  /**
   * The MCP server info. Ingored when `mcpServer` is provided
   */
  mcpServerInfo?: McpServerInfo

  /**
   * Custom MCP server, when this is provided, the built-in MCP tools will be ignored
   */
  mcpServer?: (viteServer: ViteDevServer, ctx: VueMcpContext) => Awaitable<McpServer>

  /**
   * The editor to use for the click-to-component feature
   *
   * @default 'cursor'
   */
  editor?: string

  /**
   * Setup the MCP server, this is called when the MCP server is created
   * You may also return a new MCP server to replace the default one
   */
  mcpServerSetup?: (server: McpServer, viteServer: ViteDevServer) => Awaitable<void | McpServer>

  /**
   * The path to the MCP server, default is `/__mcp`
   */
  mcpPath?: string

  /**
   * Update the address of the MCP server in the cursor config file `.cursor/mcp.json`,
   * if `.cursor` folder exists.
   *
   * @default true
   */
  updateCursorMcpJson?: boolean | {
    enabled: boolean
    /**
     * The name of the MCP server, default is `vue-mcp`
     */
    serverName?: string
  }

  /**
   * append an import to the module id ending with `appendTo` instead of adding a script into body
   * useful for projects that do not use html file as an entry
   *
   * WARNING: only set this if you know exactly what it does.
   * @default ''
   */
  appendTo?: string | RegExp

  /**
   * Enable the click-to-component feature
   *
   * @default true
   */
  enableClickToComponent?: boolean

  /**
   * UI评审元素保存配置
   */
  uiReviewSave?: {
    /**
     * 是否启用保存功能
     *
     * @default false
     */
    enabled: boolean

    /**
     * 保存目录，相对于项目根目录
     *
     * @default '.vue-mcp/ui-review'
     */
    directory?: string

    /**
     * 自动保存间隔（毫秒），设为0表示仅在收到数据时保存
     *
     * @default 0
     */
    autoSaveInterval?: number
  }
}
