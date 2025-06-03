import { window } from 'vscode'

// 创建一个简单的日志工具
export const logger = {
  info(message: string, ...args: any[]) {
    console.log(`[VSCode Server] INFO: ${message}`, ...args)
  },

  warn(message: string, ...args: any[]) {
    console.warn(`[VSCode Server] WARN: ${message}`, ...args)
  },

  error(message: string, ...args: any[]) {
    console.error(`[VSCode Server] ERROR: ${message}`, ...args)
    // 对于错误，也在VSCode中显示通知
    if (typeof message === 'string') {
      window.showErrorMessage(`[AIReview] ${message}`)
    }
  },

  debug(message: string, ...args: any[]) {
    console.debug(`[VSCode Server] DEBUG: ${message}`, ...args)
  },
}
