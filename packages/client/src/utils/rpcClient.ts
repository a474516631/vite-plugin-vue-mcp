/**
 * RPC客户端工具，用于与MCP服务通信
 */

// 定义UI评审元素接口
interface UIReviewElement {
  name: string
  path: string
  type?: string
  comment?: string
  screenshot?: string
}

// 定义RPC函数接口
interface RpcFunctions {
  sendUIReviewElements: (elements: UIReviewElement[]) => void
  [key: string]: any
}

/**
 * 设置RPC客户端
 */
export function setupRpcClient() {
  // 创建RPC客户端对象
  const rpcClient: RpcFunctions = {
    // 发送UI评审元素到服务器
    sendUIReviewElements: (elements: UIReviewElement[]) => {
      // 使用fetch API发送数据到服务器
      fetch('/__mcp/api/ui-review-elements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(elements),
      })
        .then((response) => {
          if (response.ok) {
            console.error('UI评审元素已成功发送到服务器')
          }
          else {
            console.error('发送UI评审元素失败:', response.statusText)
          }
        })
        .catch((error) => {
          console.error('发送UI评审元素失败:', error)
        })
    },

  }

  // 将RPC客户端挂载到全局对象
  window.__VUE_MCP_RPC__ = rpcClient as any

  return rpcClient
}

/**
 * 获取RPC客户端
 */
export function getRpcClient(): RpcFunctions | undefined {
  return window.__VUE_MCP_RPC__
}
