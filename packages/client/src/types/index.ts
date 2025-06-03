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
  /** 元素稳定标识符，由元素的属性组合生成 */
  stableId?: string

  /** 是否已提交 */
  isSubmitted?: boolean
  /** 是否已修复 */
  isFixed?: boolean
}

/**
 * 保存状态类型
 */
export interface SaveStatus {
  /** 状态类型 */
  type: 'success' | 'error' | 'info'
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

/**
 * 元素稳定标识符接口
 */
export interface ElementStableId {
  /** 元素标签名 */
  tagName: string
  /** 元素类名列表 */
  classList: string[]
  /** 元素id */
  id?: string
  /** 元素内部文本（简短） */
  textContent?: string
  /** 元素属性 */
  attributes?: Record<string, string>
  /** DOM路径 (nth-child组合) */
  domPath?: string
}
