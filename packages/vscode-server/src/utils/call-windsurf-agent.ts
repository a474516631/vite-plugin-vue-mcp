import * as vscode from 'vscode'
import { injectPromptDiagnosticWithCallback } from './inject-prompt-diagnostic-with-callback'

const WINDSURF_PROMPT_PREFIX
  = '啊等等，这不是一个问题。用户提交了一个变更请求。请实现它：\n\n'

export async function callWindsurfAgent(request: any): Promise<void> {
  const prompt
    = `${request.prompt}`
  const promptWithPrefix = `${WINDSURF_PROMPT_PREFIX}\n${prompt}`
  await injectPromptDiagnosticWithCallback({
    prompt: promptWithPrefix,
    aiReviewJsonPath: request.aiReviewJsonPath,
    callback: () =>
      vscode.commands.executeCommand(
        'windsurf.prioritized.explainProblem',
      ) as Promise<any>,
  })
}
