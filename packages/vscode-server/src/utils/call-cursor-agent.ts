import * as vscode from 'vscode'
import { injectPromptDiagnosticWithCallback } from './inject-prompt-diagnostic-with-callback'

/**
 * Cursor AI代理提示前缀
 *
 * 这个前缀用于告诉Cursor AI这不是一个错误，而是一个用户提交的变更请求。
 * 使用Markdown代码块格式，便于AI识别和处理。
 */
const CURSOR_PROMPT_PREFIX = `\`\`\`
    啊，抱歉，这不是一个错误。用户提交了一个变更请求。以下是请求内容，请实现它：
    \`\`\``

/**
 * 调用Cursor AI代理处理请求
 *
 * 该函数接收用户的请求，格式化提示信息，然后通过注入诊断的方式触发Cursor AI进行代码编辑。
 *
 * @param request 包含提示词和相关文件/图像信息的请求对象
 */
export async function callCursorAgent(request: any): Promise<void> {
  // 构建完整的提示词，包括用户的原始提示和可能的文件/图像引用
  const prompt
    = `${request.prompt}`
  // 以下是目前尚未支持的功能
  // model: request.model, not supported yet
  // `${request.model ? `\n\n use the following model: ${request.model}` : ''}` +
  // mode: request.mode, not supported yet
  // `${request.mode ? `\n\n use the following mode: ${request.mode}` : ''}`;

  // 将提示词与前缀组合，形成完整的提示内容
  const promptWithPrefix = `${CURSOR_PROMPT_PREFIX}\n${prompt}`

  // 调用注入诊断函数，并设置回调为执行Cursor的修复错误消息命令
  await injectPromptDiagnosticWithCallback({
    prompt: promptWithPrefix,
    aiReviewJsonPath: request.aiReviewJsonPath,
    callback: () => {
      // 执行Cursor的AI命令，触发AI编辑功能
      vscode.window.showInformationMessage('执行Cursor的AI命令，触发AI编辑功能')
      return vscode.commands.executeCommand(
        'composer.fixerrormessage',
      ) as Promise<any>
    },

  })
}
