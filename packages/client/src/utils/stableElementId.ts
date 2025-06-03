import type { ElementStableId } from '../types'

/**
 * 生成元素的稳定标识符
 * @param element 目标DOM元素
 * @returns 元素的稳定标识符
 */
export function generateStableId(element: HTMLElement): string {
  const stableId: ElementStableId = {
    tagName: element.tagName.toLowerCase(),
    classList: Array.from(element.classList),
  }

  // 添加ID（如果有）
  if (element.id) {
    stableId.id = element.id
  }

  // 添加简短的内部文本（限制长度，避免过长）
  const text = element.textContent || ''
  if (text.trim()) {
    stableId.textContent = text.trim().substring(0, 50)
  }

  // 收集重要属性（通常不会变的属性）
  const importantAttrs: Record<string, string> = {}
  const attrsToCopy = ['data-testid', 'data-cy', 'data-qa', 'data-test', 'role', 'type', 'name']

  for (const attr of attrsToCopy) {
    if (element.hasAttribute(attr)) {
      importantAttrs[attr] = element.getAttribute(attr) || ''
    }
  }

  if (Object.keys(importantAttrs).length > 0) {
    stableId.attributes = importantAttrs
  }

  // 计算DOM路径
  stableId.domPath = calculateDomPath(element)

  // 将稳定ID转换为字符串
  return JSON.stringify(stableId)
}

/**
 * 计算元素的DOM路径
 * @param element 目标DOM元素
 * @returns DOM路径字符串
 */
function calculateDomPath(element: HTMLElement): string {
  const path: string[] = []
  let currentEl: HTMLElement | null = element

  // 向上遍历DOM树，构建路径
  while (currentEl && currentEl !== document.body && currentEl !== document.documentElement) {
    // 找出元素在父元素中的索引位置
    const parent: HTMLElement | null = currentEl.parentElement
    if (!parent)
      break

    let index = 0
    for (let i = 0; i < parent.children.length; i++) {
      if (parent.children[i] === currentEl) {
        index = i
        break
      }
    }

    // 构建选择器: 标签名:nth-child
    const selector = `${currentEl.tagName.toLowerCase()}:nth-child(${index + 1})`
    path.unshift(selector)

    // 向上移动
    currentEl = parent
  }

  return path.join(' > ')
}

/**
 * 使用稳定标识符查找元素
 * @param stableIdJson 元素的稳定标识符JSON字符串
 * @returns 找到的DOM元素或null
 */
export function findElementByStableId(stableIdJson: string): HTMLElement | null {
  try {
    const stableId: ElementStableId = JSON.parse(stableIdJson)

    // 首先尝试通过ID查找（最快）
    if (stableId.id) {
      const elementById = document.getElementById(stableId.id)
      if (elementById && validateElement(elementById, stableId)) {
        return elementById
      }
    }

    // 然后尝试通过属性查找
    if (stableId.attributes) {
      for (const [key, value] of Object.entries(stableId.attributes)) {
        const selector = `${stableId.tagName}[${key}="${value}"]`
        const elements = document.querySelectorAll(selector)

        for (const el of elements) {
          if (validateElement(el as HTMLElement, stableId)) {
            return el as HTMLElement
          }
        }
      }
    }

    // 通过类名组合查找
    if (stableId.classList && stableId.classList.length > 0) {
      const classSelector = stableId.classList.map(c => `.${c}`).join('')
      const selector = `${stableId.tagName}${classSelector}`
      const elements = document.querySelectorAll(selector)

      for (const el of elements) {
        if (validateElement(el as HTMLElement, stableId)) {
          return el as HTMLElement
        }
      }
    }

    // 最后尝试通过DOM路径查找
    if (stableId.domPath) {
      try {
        const elements = document.querySelectorAll(stableId.domPath)
        for (const el of elements) {
          if (validateElement(el as HTMLElement, stableId)) {
            return el as HTMLElement
          }
        }
      }
      catch (e) {
        // DOM路径查询可能会失败，忽略错误
        console.log('DOM路径查询失败:', e)
      }
    }

    // 如果以上方法都失败，可以尝试更模糊的匹配
    return findElementByFuzzyMatch(stableId)
  }
  catch (error) {
    console.error('解析稳定标识符失败:', error)
    return null
  }
}

/**
 * 验证元素是否与稳定ID匹配
 * @param element 要验证的元素
 * @param stableId 稳定标识符
 * @returns 是否匹配
 */
function validateElement(element: HTMLElement, stableId: ElementStableId): boolean {
  // 标签名必须匹配
  if (element.tagName.toLowerCase() !== stableId.tagName) {
    return false
  }

  // 验证ID（如果有）
  if (stableId.id && element.id !== stableId.id) {
    return false
  }

  // 验证类名列表（如果有）
  if (stableId.classList && stableId.classList.length > 0) {
    for (const className of stableId.classList) {
      if (!element.classList.contains(className)) {
        return false
      }
    }
  }

  // 验证属性（如果有）
  if (stableId.attributes) {
    for (const [key, value] of Object.entries(stableId.attributes)) {
      if (element.getAttribute(key) !== value) {
        return false
      }
    }
  }

  // 文本内容匹配（如果指定）- 使用包含而不是完全匹配
  if (stableId.textContent && element.textContent) {
    const elementText = element.textContent.trim()
    if (!elementText.includes(stableId.textContent)) {
      return false
    }
  }

  return true
}

/**
 * 通过模糊匹配查找元素
 * @param stableId 稳定标识符
 * @returns 找到的DOM元素或null
 */
function findElementByFuzzyMatch(stableId: ElementStableId): HTMLElement | null {
  // 创建一个基本选择器
  let selector = stableId.tagName

  // 添加ID（如果有）
  if (stableId.id) {
    selector += `#${stableId.id}`
  }

  // 添加类（使用第一个类，如果有多个）
  if (stableId.classList && stableId.classList.length > 0) {
    selector += `.${stableId.classList[0]}`
  }

  // 查找匹配的元素
  const elements = document.querySelectorAll(selector)

  // 如果只有一个结果，直接返回
  if (elements.length === 1) {
    return elements[0] as HTMLElement
  }

  // 如果有多个结果，尝试找到最匹配的
  let bestMatch: HTMLElement | null = null
  let highestScore = 0

  for (const el of elements) {
    const score = calculateMatchScore(el as HTMLElement, stableId)
    if (score > highestScore) {
      highestScore = score
      bestMatch = el as HTMLElement
    }
  }

  return bestMatch
}

/**
 * 计算元素与稳定ID的匹配分数
 * @param element 元素
 * @param stableId 稳定标识符
 * @returns 匹配分数
 */
function calculateMatchScore(element: HTMLElement, stableId: ElementStableId): number {
  let score = 0

  // 标签名匹配
  if (element.tagName.toLowerCase() === stableId.tagName) {
    score += 10
  }

  // ID匹配（高权重）
  if (stableId.id && element.id === stableId.id) {
    score += 50
  }

  // 类名匹配
  if (stableId.classList) {
    for (const className of stableId.classList) {
      if (element.classList.contains(className)) {
        score += 5
      }
    }
  }

  // 属性匹配
  if (stableId.attributes) {
    for (const [key, value] of Object.entries(stableId.attributes)) {
      if (element.getAttribute(key) === value) {
        score += 10
      }
    }
  }

  // 文本内容匹配
  if (stableId.textContent && element.textContent) {
    const elementText = element.textContent.trim()
    if (elementText.includes(stableId.textContent)) {
      score += 15
    }
  }

  return score
}

/**
 * 更新元素的稳定标识符
 * @param elements 元素信息列表
 */
export function updateElementsWithStableId(elements: any[]): void {
  for (const element of elements) {
    if (element.path && !element.stableId) {
      const domElement = findElementByPath(element.path)
      if (domElement) {
        element.stableId = generateStableId(domElement)
      }
    }
  }
}

/**
 * 查找带有源代码位置信息的元素（兼容原有方法）
 * @param path 元素路径
 * @returns 找到的DOM元素或null
 */
export function findElementByPath(path: string): HTMLElement | null {
  // 首先通过data属性直接查找
  const elements = document.querySelectorAll(`[data-__source-code-location="${path}"]`)
  if (elements.length > 0) {
    return elements[0] as HTMLElement
  }

  // 尝试其他方式查找
  const allElements = document.querySelectorAll('*')
  for (const el of allElements) {
    const htmlEl = el as HTMLElement
    if (htmlEl.dataset && htmlEl.dataset.__sourceCodeLocation === path) {
      return htmlEl
    }
  }

  return null
}
