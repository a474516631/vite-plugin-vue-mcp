import * as vscode from 'vscode'
import { logger } from '../utils/log'

/**
 * 处理AI编辑请求
 * @param fileInfo 文件信息
 * @returns 处理结果
 */
export async function processAIEditRequest(fileInfo: { filePath: string, prompt: string }) {
  try {
    logger.info(`Processing AI edit request for ${fileInfo.filePath}`)

    // 打开文件
    let document: vscode.TextDocument
    try {
      document = await vscode.workspace.openTextDocument(fileInfo.filePath)
    }
    catch (error) {
      logger.error(`Failed to open file ${fileInfo.filePath}:`, error)
      return {
        success: false,
        error: `无法打开文件: ${fileInfo.filePath}`,
      }
    }

    // 显示文档
    try {
      await vscode.window.showTextDocument(document)
    }
    catch (error) {
      logger.error(`Failed to show document ${fileInfo.filePath}:`, error)
      return {
        success: false,
        error: `无法显示文件: ${fileInfo.filePath}`,
      }
    }

    // 检查是否有Cursor AI命令
    const hasCursorAI = vscode.commands.getCommands(true).then(
      commands => commands.includes('cursor.aiAssisted'),
    )

    if (await hasCursorAI) {
      // 使用Cursor AI
      try {
        await vscode.commands.executeCommand('cursor.aiAssisted', fileInfo.prompt)
        return {
          success: true,
          message: '已成功使用Cursor AI执行编辑请求',
        }
      }
      catch (error) {
        logger.error('Failed to execute Cursor AI command:', error)
        return {
          success: false,
          error: `执行Cursor AI命令失败: ${error instanceof Error ? error.message : String(error)}`,
        }
      }
    }
    else {
      // 如果没有Cursor AI，则使用其他方式处理
      // 例如，可以显示提示信息，让用户手动处理
      vscode.window.showInformationMessage(
        `AI编辑请求: ${fileInfo.filePath}\n\n提示: ${fileInfo.prompt}\n\n未检测到Cursor AI，请手动处理`,
      )

      return {
        success: true,
        message: '已显示编辑请求，请手动处理',
      }
    }
  }
  catch (error: any) {
    logger.error('执行AI编辑请求失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
