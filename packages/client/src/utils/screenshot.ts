// @ts-expect-error dom-to-image-more缺少类型定义
import domToImage from 'dom-to-image-more'

/**
 * 对目标元素进行截图
 * @param targetElement 目标DOM元素
 * @param onSuccess 成功回调
 * @param onError 错误回调
 */
export async function captureElementScreenshot(
  targetElement: HTMLElement | null,
  onSuccess: (dataUrl: string) => void,
  onError: (error: Error) => void,
): Promise<void> {
  try {
    if (!targetElement) {
      onError(new Error('未找到要截图的元素'))
      return
    }

    // 使用父元素作为截图目标
    const parentElement = targetElement.parentElement
    if (!parentElement) {
      onError(new Error('元素没有父元素'))
      return
    }

    // 保存原始样式
    const originalOutline = targetElement.style.outline
    const originalOutlineOffset = targetElement.style.outlineOffset
    const originalZIndex = targetElement.style.zIndex
    const originalPosition = targetElement.style.position

    // 设置高亮样式
    targetElement.style.outline = '2px solid #4f46e5'
    targetElement.style.outlineOffset = '2px'
    targetElement.style.zIndex = '1'
    if (getComputedStyle(targetElement).position === 'static') {
      targetElement.style.position = 'relative'
    }

    try {
      // 使用dom-to-image-more库进行截图
      const dataUrl = await domToImage.toPng(parentElement, {
        bgcolor: null,
        cacheBust: true,
        quality: 1.0,
      })

      // 成功回调
      onSuccess(dataUrl)
    }
    catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)))
    }
    finally {
      // 恢复元素原始样式
      targetElement.style.outline = originalOutline
      targetElement.style.outlineOffset = originalOutlineOffset
      targetElement.style.zIndex = originalZIndex
      targetElement.style.position = originalPosition
    }
  }
  catch (error) {
    onError(error instanceof Error ? error : new Error(String(error)))
  }
}

/**
 * 查找带有源代码位置信息的元素
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
