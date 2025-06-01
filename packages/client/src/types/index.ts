/**
 * 元素信息接口
 */
export interface ElementInfo {
  /** 元素名称 */
  name: string
  /** 元素路径（源代码位置） */
  path: string
  /** 元素类型 */
  type?: string
  /** 元素评论 */
  comment?: string
  /** 元素截图（Data URL） */
  screenshot?: string
}

/**
 * 保存状态类型
 */
export interface SaveStatus {
  /** 状态类型 */
  type: 'success' | 'error'
  /** 状态消息 */
  message: string
  /** 时间戳 */
  timestamp: number
}

/**
 * 通知类型
 */
export type NotificationType = 'success' | 'error' | 'info'

/**
 * 位置信息
 */
export interface Position {
  top: number
  left: number
}
