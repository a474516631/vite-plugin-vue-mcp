import type { RpcFunctions, UIReviewElement, VueMcpContext } from './types'

// 存储UI走查元素的临时变量
let _uiReviewElements: UIReviewElement[] = []

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
  }
}
