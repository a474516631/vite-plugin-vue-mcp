import type { RpcFunctions, UIReviewElement, VueMcpContext } from './types'

// 存储UI走查元素的临时变量
let _uiReviewElements: UIReviewElement[] = []

// AI编辑请求接口
export interface AIEditRequest {
  filePath: string
  prompt: string
}

// AI编辑结果接口
export interface AIEditResult {
  success: boolean
  message?: string
  error?: string
}

export function createServerRpc(ctx: VueMcpContext): RpcFunctions {
  return {
    // component tree
    getInspectorTree: (_: { event: string, componentName?: string }) => ({}),
    onInspectorTreeUpdated: (event: string, data: string) => {
      ctx.hooks.callHook(event, data)
    },
    // component state
    getInspectorState: (_: { event: string, componentName: string }) => ({}),
    onInspectorStateUpdated: (event: string, data: string) => {
      ctx.hooks.callHook(event, data)
    },
    // component edit
    editComponentState: (options: { componentName: string, path: string[], value: string, valueType: string }) => {
      ctx.hooks.callHook('edit-component-state', JSON.stringify(options))
    },
    highlightComponent: (options: { componentName: string }) => {
      ctx.hooks.callHook('highlight-component', JSON.stringify(options))
    },
    // router info
    getRouterInfo: (_: { event: string }) => ({}),
    onRouterInfoUpdated: (event: string, data: string) => {
      ctx.hooks.callHook(event, data)
    },
    // pinia tree
    getPiniaTree: (_: { event: string }) => ({}),
    onPiniaTreeUpdated: (event: string, data: string) => {
      ctx.hooks.callHook(event, data)
    },
    // pinia state
    getPiniaState: (_: { event: string, storeName: string }) => ({}),
    onPiniaInfoUpdated: (event: string, data: string) => {
      ctx.hooks.callHook(event, data)
    },
    // ui review elements
    sendUIReviewElements: (elements: UIReviewElement[]) => {
      // 更新缓存的UI走查元素
      _uiReviewElements = elements || []
      // 接收UI评审元素并触发钩子
      ctx.hooks.callHook('ui-review-elements-updated', JSON.stringify(elements))
    },
    onUIReviewElementsUpdated: (event: string, data: string) => {
      ctx.hooks.callHook(event, data)
    },

    // 获取UI走查元素
    getUIReviewElements: (_: { event: string }) => {
      try {
        console.log('getUIReviewElements', _uiReviewElements)
        // 使用try-catch包裹，避免JSON序列化错误导致未处理的异常
        const elementsToSend = _uiReviewElements || []
        const dataString = JSON.stringify(elementsToSend)
        ctx.hooks.callHook(_.event, dataString)
      }
      catch (error) {
        console.error('获取UI走查元素失败:', error)
        // 发送空数组作为回退
        ctx.hooks.callHook(_.event, '[]')
      }
      return {}
    },

    // 处理AI编辑请求
    handleAIEdit: async (request: AIEditRequest): Promise<AIEditResult> => {
      try {
        console.log('接收到AI编辑请求:', request)
        // 触发钩子，通知VSCode扩展处理此请求
        ctx.hooks.callHook('ai-edit-request', JSON.stringify(request))

        // 这里可以添加更多逻辑，例如记录请求、验证文件路径等

        return {
          success: true,
          message: '已成功发送AI编辑请求到VSCode扩展',
        }
      }
      catch (error) {
        console.error('处理AI编辑请求失败:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        }
      }
    },

    // 接收AI编辑结果
    onAIEditResult: (event: string, data: string) => {
      ctx.hooks.callHook(event, data)
    },
  }
}
