// 为外部模块声明类型
declare module 'express';
declare module 'cors';
declare module 'reactive-vscode';

// 添加AI编辑请求的类型
export interface AIEditRequest {
  filePath?: string
  prompt: string
  aiReviewJsonPath?: string
}

export interface AIEditResponse {
  success: boolean
  message?: string
  error?: string
}
