import * as vscode from 'vscode'
import { DIAGNOSTIC_COLLECTION_NAME } from '../constants'

/**
 * 注入提示诊断并执行回调函数
 *
 * 该函数的主要作用是创建一个假的诊断信息（diagnostic），将用户的提示作为错误信息显示在编辑器中，
 * 然后触发回调函数（通常是AI编辑命令）。这种方式可以让AI助手获取到用户的提示内容。
 *
 * @param params 包含提示文本和回调函数的参数对象
 */
export async function injectPromptDiagnosticWithCallback(params: {
  prompt: string // 提示文本，将作为诊断信息显示
  aiReviewJsonPath?: string // 评审文件路径
  callback: () => Promise<any> // 注入提示后要执行的回调函数
}): Promise<void> {
  let editor = vscode.window.activeTextEditor
  let document = null
  console.log('params.aiReviewJsonPath', params.aiReviewJsonPath)
  if (params.aiReviewJsonPath) {
    document = await vscode.workspace.openTextDocument(vscode.Uri.file(params.aiReviewJsonPath))
    editor = await vscode.window.showTextDocument(document)
  }
  else {
    try {
      // 如果没有活动的编辑器，则尝试打开工作区中的第一个文件
      const files = await vscode.workspace.findFiles(
        '**/*',
        '**/node_modules/**', // 排除node_modules目录
      )

      if (files.length === 0) {
        vscode.window.showErrorMessage('No files found in workspace to open.')
        return
      }

      // 打开找到的第一个文件
      document = await vscode.workspace.openTextDocument(files[0])
      editor = await vscode.window.showTextDocument(document)
    }
    catch (error: any) {
      console.error(error)
      vscode.window.showErrorMessage(
        'Failed to open existing file for prompt injection.',
      )
      return
    }
    // 等待200毫秒确保编辑器已准备就绪
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  // 创建诊断集合，用于设置和清除诊断信息
  const fakeDiagCollection = vscode.languages.createDiagnosticCollection(
    DIAGNOSTIC_COLLECTION_NAME,
  )

  try {
    // 使用当前选择范围或整个文档范围
    const selectionOrFullDocRange = editor.selection.isEmpty
      ? new vscode.Range(0, 0, document.lineCount, 0) // 如果没有选择，则使用整个文档
      : editor.selection // 使用实际选择的范围

    // 1. 创建假的诊断对象
    const fakeDiagnostic = new vscode.Diagnostic(
      selectionOrFullDocRange,
      params.prompt, // 使用提示文本作为诊断消息
      vscode.DiagnosticSeverity.Error, // 设置为错误级别
    )
    fakeDiagnostic.source = DIAGNOSTIC_COLLECTION_NAME

    // 2. 设置诊断信息
    fakeDiagCollection.set(document.uri, [fakeDiagnostic])

    // 3. 确保光标位于诊断范围内（例如，起始位置）
    editor.selection = new vscode.Selection(
      selectionOrFullDocRange.start,
      selectionOrFullDocRange.start,
    )

    // 4. 执行回调函数（通常是触发AI编辑命令）
    await params.callback()
    vscode.window.showInformationMessage(`Triggered agent for prompt.`) // 简化的消息
  }
  catch (error) {
    vscode.window.showErrorMessage(`Failed to inject prompt: ${error}`)
  }
  finally {
    // 重要：清理诊断信息，使用上面创建的同一个集合实例
    if (document) {
      // 检查文档是否仍然有效（应该是有效的）
      // 从集合中清除此URI的特定诊断
      fakeDiagCollection.delete(document.uri)
    }
    else {
      fakeDiagCollection.clear() // 如果URI丢失，则清除所有内容
    }
    // 释放集合以清理资源
    fakeDiagCollection.dispose()
  }
}
