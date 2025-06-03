import { defineExtension, useCommand, useIsDarkTheme, watchEffect } from 'reactive-vscode'
import { commands, window, workspace } from 'vscode'
import { message, port } from './configs'
import { handleAIEditRequest, startServer, stopServer } from './server'
import { logger } from './utils/log'

export default defineExtension(() => {
  logger.info('Extension Activated')

  // 启动服务器
  let serverStarted = false

  // 自动启动服务器
  startServer(port.value).then(() => {
    serverStarted = true
  }).catch((error) => {
    logger.error('Failed to auto-start server:', error)
  })

  // 注册命令
  useCommand('@aireview/vscode-server.helloWorld', () => {
    window.showInformationMessage(message.value)
  })

  // 启动服务器命令
  useCommand('@aireview/vscode-server.startServer', async () => {
    if (serverStarted) {
      window.showInformationMessage('AIReview server is already running')
      return
    }

    try {
      await startServer(port.value)
      serverStarted = true
    }
    catch (error) {
      logger.error('Failed to start server:', error)
    }
  })

  // 停止服务器命令
  useCommand('@aireview/vscode-server.stopServer', async () => {
    if (!serverStarted) {
      window.showInformationMessage('AIReview server is not running')
      return
    }

    try {
      await stopServer()
      serverStarted = false
    }
    catch (error) {
      logger.error('Failed to stop server:', error)
    }
  })

  // 处理AI编辑请求命令
  useCommand('@aireview/vscode-server.handleAIEdit', async (fileInfo: { filePath: string, prompt: string }) => {
    return await handleAIEditRequest(fileInfo)
  })

  // 监听主题变化
  const isDark = useIsDarkTheme()
  watchEffect(() => {
    logger.info('Is Dark Theme:', isDark.value)
  })

  // 清理函数
  return async () => {
    if (serverStarted) {
      await stopServer()
      serverStarted = false
    }
  }
})
