/// <reference types="vite/client" />

// 全局编辑器配置
interface Window {
  __EDITOR__?: string
  __VUE_CLICK_TO_COMPONENT_URL_FUNCTION__?: (options: { sourceCodeLocation: string }) => string | Promise<string>
  __VUE_MCP_RPC__: {
    sendUIReviewElements: (elements: ElementInfo[]) => void
  }
}
