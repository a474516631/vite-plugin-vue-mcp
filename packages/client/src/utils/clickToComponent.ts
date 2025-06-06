// 设置目标元素的高亮标记
export function setTarget(el: Element, type = ''): void {
  if(el.hasAttribute(ignoreKey)){
    return
  }
  cleanTarget()
  el.setAttribute('vue-click-to-component-target', type)
  // 当设置高亮时，显示盒模型
  if (type) {
    showBoxModel(el as HTMLElement)
  }
}

// 清除目标元素的高亮标记
export function cleanTarget(type?: string): void {
  let targetElList: NodeListOf<Element>

  if (type) {
    targetElList = document.querySelectorAll(
      `[vue-click-to-component-target="${type}"]`,
    )
  }
  else {
    targetElList = document.querySelectorAll(
      '[vue-click-to-component-target]',
    )
  }

  targetElList.forEach((el) => {
    el.removeAttribute('vue-click-to-component-target')
  })

}

// 检查是否应该处理 Alt 点击事件
export function checkHandleAltClick(clickEvent: MouseEvent): boolean {
  if (!clickEvent.altKey || clickEvent.button !== 0) {
    return false
  }

  let el = clickEvent.target as Element | null

  try {
    while (
      el
      && !el.hasAttribute('vue-click-to-component-ignore-alt-click')
    ) {
      el = el.parentElement
    }
  }
  catch {
    return false
  }

  if (el) {
    return false
  }

  return true
}

// 获取带有源代码位置信息的元素
export function getElWithSourceCodeLocation(el: Element | null): HTMLElement | null {
  if (!el)
    return null

  try {
    let currentEl = el as HTMLElement
    while (currentEl && !currentEl.dataset.__sourceCodeLocation) {
      if (!currentEl.parentElement)
        break
      currentEl = currentEl.parentElement as HTMLElement
    }

    return currentEl && currentEl.dataset.__sourceCodeLocation ? currentEl : null
  }
  catch {
    return null
  }
}

// 打开编辑器
export function openEditor(sourceCodeLocation: string, editor = 'cursor'): void {
  // __VUE_CLICK_TO_COMPONENT_URL_FUNCTION__ 可以是异步的
  const urlPromise = Promise.resolve().then(() => {
    if (
      typeof window.__VUE_CLICK_TO_COMPONENT_URL_FUNCTION__ !== 'function'
    ) {
      // 修复 https://github.com/click-to-component/vue-click-to-component/issues/4
      if (sourceCodeLocation.startsWith('/')) {
        return `${editor}://file${sourceCodeLocation}`
      }

      return `${editor}://file/${sourceCodeLocation}`
    }

    return window.__VUE_CLICK_TO_COMPONENT_URL_FUNCTION__({
      sourceCodeLocation,
    })
  })

  urlPromise
    .then((url) => {
      if (!url) {
        console.error(
          '[vue-click-to-component] url is empty, please check __VUE_CLICK_TO_COMPONENT_URL_FUNCTION__',
        )
        return
      }

      window.location.assign(url)
    })
    .catch((e) => {
      console.error(e)
    })
    .finally(() => {
      cleanTarget()
    })
}

// 获取元素列表中带有源代码位置信息的元素
export function getElListWithSourceCodeLocation(el: Element | null): HTMLElement[] {
  const elList: HTMLElement[] = []

  let elWithSourceCodeLocation = getElWithSourceCodeLocation(el)

  while (elWithSourceCodeLocation) {
    elList.push(elWithSourceCodeLocation)
    elWithSourceCodeLocation = getElWithSourceCodeLocation(
      elWithSourceCodeLocation.parentElement,
    )
  }

  return elList
}

// 获取组件信息列表
export interface ComponentInfo {
  el: HTMLElement
  sourceCodeLocation: string
  localName: string
}

export function getComponentInfoList(elList: (HTMLElement | Element)[]): ComponentInfo[] {
  const componentInfoList: ComponentInfo[] = []

  for (const el of elList) {
    const htmlEl = el as HTMLElement
    const sourceCodeLocation = htmlEl.dataset.__sourceCodeLocation
    if (!sourceCodeLocation)
      continue

    const componentInfo: ComponentInfo = {
      el: htmlEl,
      sourceCodeLocation,
      localName: htmlEl.localName,
    }

    componentInfoList.push(componentInfo)
  }

  return componentInfoList
}
let lastShowBoxModelElement: HTMLElement | null = null
const ignoreKey = 'ai-review-inspect-element-ignore'
// 显示元素的盒模型（padding/margin）
export function showBoxModel(element: HTMLElement): void {
  
  if (!element || lastShowBoxModelElement === element)
    return

  lastShowBoxModelElement = element
  // 检查是否已存在盒模型容器
  let container = document.getElementById('vue-mcp-box-model-container')
  const isNewContainer = !container

  if (isNewContainer) {
    // 如果不存在，创建新容器
    container = document.createElement('div')
    container.id = 'vue-mcp-box-model-container'
    container.style.position = 'fixed'
    container.style.pointerEvents = 'none' // 确保容器不捕获鼠标事件
    container.style.zIndex = '99999'
    container.style.top = '0'
    container.style.left = '0'
    container.setAttribute(ignoreKey,'true')
    document.body.appendChild(container)
  } else if (container) {
    // 如果存在，清空内容并显示
    container.innerHTML = ''
    container.style.display = 'block'
    container.style.pointerEvents = 'none'
  }

  // 确保container非空
  if (!container) return;

  const rect = element.getBoundingClientRect()
  const computedStyle = window.getComputedStyle(element)

  // 获取 padding 值
  const paddingTop = Number.parseInt(computedStyle.paddingTop, 10)
  const paddingRight = Number.parseInt(computedStyle.paddingRight, 10)
  const paddingBottom = Number.parseInt(computedStyle.paddingBottom, 10)
  const paddingLeft = Number.parseInt(computedStyle.paddingLeft, 10)

  // 获取 margin 值
  const marginTop = Number.parseInt(computedStyle.marginTop, 10)
  const marginRight = Number.parseInt(computedStyle.marginRight, 10)
  const marginBottom = Number.parseInt(computedStyle.marginBottom, 10)
  const marginLeft = Number.parseInt(computedStyle.marginLeft, 10)

  // 创建元素本身的高亮区域
  createElementHighlight(container, rect, element, computedStyle)

  // 创建 padding 高亮区域
  if (paddingTop || paddingRight || paddingBottom || paddingLeft) {
    createBoxModelHighlight(container, rect, {
      top: paddingTop,
      right: paddingRight,
      bottom: paddingBottom,
      left: paddingLeft,
    }, 'padding')
  }

  // 创建 margin 高亮区域
  if (marginTop || marginRight || marginBottom || marginLeft) {
    createBoxModelHighlight(container, rect, {
      top: marginTop,
      right: marginRight,
      bottom: marginBottom,
      left: marginLeft,
    }, 'margin')
  }
}

// 创建元素本身的高亮显示
function createElementHighlight(
  container: HTMLElement,
  rect: DOMRect,
  element: HTMLElement,
  computedStyle: CSSStyleDeclaration,
): void {
  const elementEl = document.createElement('div')
  elementEl.className = 'vue-mcp-box-model-highlight vue-mcp-element'
  elementEl.style.position = 'fixed'
  elementEl.style.top = `${rect.top}px`
  elementEl.style.left = `${rect.left}px`
  elementEl.style.width = `${rect.width}px`
  elementEl.style.height = `${rect.height}px`
  elementEl.style.backgroundColor = 'rgba(111, 168, 220, 0.25)'
  elementEl.style.border = '1px dashed rgba(111, 168, 220, 0.8)'
  elementEl.style.boxSizing = 'border-box'
  elementEl.style.userSelect = 'none'
  elementEl.style.pointerEvents = 'none' // 确保元素高亮不捕获鼠标事件
  elementEl.setAttribute(ignoreKey,'true')

  // 创建元素信息面板
  const infoPanel = document.createElement('div')
  infoPanel.className = 'vue-mcp-element-info-panel'
  infoPanel.style.position = 'absolute'
  infoPanel.style.top = '0'
  infoPanel.style.right = '0'
  infoPanel.style.transform = 'translateY(-100%)'
  infoPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
  infoPanel.style.color = 'white'
  infoPanel.style.padding = '4px 8px'
  infoPanel.style.borderRadius = '3px'
  infoPanel.style.fontSize = '11px'
  infoPanel.style.fontFamily = 'monospace'
  infoPanel.style.whiteSpace = 'nowrap'
  infoPanel.style.zIndex = '100000'
  infoPanel.style.userSelect = 'none'
  infoPanel.style.pointerEvents = 'none' // 确保信息面板不捕获鼠标事件

  // 收集元素样式信息
  const tagName = element.tagName.toLowerCase()
  const width = Math.round(rect.width)
  const height = Math.round(rect.height)
  const backgroundColor = computedStyle.backgroundColor
  const fontSize = computedStyle.fontSize
  const color = computedStyle.color
  const className = element.className ? `.${element.className.split(' ').join('.')}` : ''

  infoPanel.innerHTML = `
    <div><strong>${tagName}${className}</strong></div>
    <div>尺寸: ${width}px × ${height}px</div>
    <div>字体: ${fontSize}/${color}</div>
    <div>背景: ${backgroundColor}</div>
  `

  elementEl.appendChild(infoPanel)
  container.appendChild(elementEl)
}

// 创建盒模型高亮显示
function createBoxModelHighlight(
  container: HTMLElement,
  rect: DOMRect,
  values: { top: number, right: number, bottom: number, left: number },
  type: 'padding' | 'margin',
): void {
  const color = type === 'padding' ? 'rgba(118, 215, 254, 0.35)' : 'rgba(246, 178, 107, 0.35)'
  const textColor = type === 'padding' ? 'rgb(28, 171, 226)' : 'rgb(229, 153, 57)'
  const borderStyle = type === 'padding' ? '1px dashed rgba(28, 171, 226, 0.8)' : '1px dashed rgba(229, 153, 57, 0.8)'

  // 顶部区域
  if (values.top > 0) {
    const topEl = document.createElement('div')
    topEl.className = `vue-mcp-box-model-highlight vue-mcp-${type}-top`
    topEl.style.position = 'fixed'
    topEl.style.backgroundColor = color
    topEl.style.top = `${type === 'padding' ? rect.top : rect.top - values.top}px`
    topEl.style.left = `${type === 'padding' ? rect.left : rect.left - values.left}px`
    topEl.style.width = `${type === 'padding' ? rect.width : rect.width + values.left + values.right}px`
    topEl.style.height = `${values.top}px`
    topEl.style.border = borderStyle
    topEl.style.boxSizing = 'border-box'
    topEl.style.userSelect = 'none'
    topEl.style.pointerEvents = 'none' // 确保盒模型高亮不捕获鼠标事件

    // 添加数值标签
    const topLabel = document.createElement('div')
    topLabel.className = 'vue-mcp-box-model-label'
    topLabel.textContent = `${values.top}px`
    topLabel.style.position = 'absolute'
    topLabel.style.top = '50%'
    topLabel.style.left = '50%'
    topLabel.style.transform = 'translate(-50%, -50%)'
    topLabel.style.backgroundColor = 'white'
    topLabel.style.color = textColor
    topLabel.style.padding = '1px 4px'
    topLabel.style.borderRadius = '2px'
    topLabel.style.fontSize = '10px'
    topLabel.style.fontWeight = 'bold'
    topLabel.style.userSelect = 'none'
    topLabel.style.pointerEvents = 'none' // 确保标签不捕获鼠标事件

    topEl.appendChild(topLabel)
    container.appendChild(topEl)
  }

  // 右侧区域
  if (values.right > 0) {
    const rightEl = document.createElement('div')
    rightEl.className = `vue-mcp-box-model-highlight vue-mcp-${type}-right`
    rightEl.style.position = 'fixed'
    rightEl.style.backgroundColor = color
    rightEl.style.top = `${type === 'padding' ? rect.top : rect.top - values.top}px`
    rightEl.style.left = `${type === 'padding' ? rect.right - values.right : rect.right}px`
    rightEl.style.width = `${values.right}px`
    rightEl.style.height = `${type === 'padding' ? rect.height : rect.height + values.top + values.bottom}px`
    rightEl.style.border = borderStyle
    rightEl.style.boxSizing = 'border-box'
    rightEl.style.userSelect = 'none'
    rightEl.style.pointerEvents = 'none' // 确保盒模型高亮不捕获鼠标事件
    rightEl.setAttribute(ignoreKey,'true')
    // 添加数值标签
    const rightLabel = document.createElement('div')
    rightLabel.className = 'vue-mcp-box-model-label'
    rightLabel.textContent = `${values.right}px`
    rightLabel.style.position = 'absolute'
    rightLabel.style.top = '50%'
    rightLabel.style.left = '50%'
    rightLabel.style.transform = 'translate(-50%, -50%)'
    rightLabel.style.backgroundColor = 'white'
    rightLabel.style.color = textColor
    rightLabel.style.padding = '1px 4px'
    rightLabel.style.borderRadius = '2px'
    rightLabel.style.fontSize = '10px'
    rightLabel.style.fontWeight = 'bold'
    rightLabel.style.userSelect = 'none'
    rightLabel.style.pointerEvents = 'none' // 确保标签不捕获鼠标事件

    rightEl.appendChild(rightLabel)
    container.appendChild(rightEl)
  }

  // 底部区域
  if (values.bottom > 0) {
    const bottomEl = document.createElement('div')
    bottomEl.className = `vue-mcp-box-model-highlight vue-mcp-${type}-bottom`
    bottomEl.style.position = 'fixed'
    bottomEl.style.backgroundColor = color
    bottomEl.style.top = `${type === 'padding' ? rect.bottom - values.bottom : rect.bottom}px`
    bottomEl.style.left = `${type === 'padding' ? rect.left : rect.left - values.left}px`
    bottomEl.style.width = `${type === 'padding' ? rect.width : rect.width + values.left + values.right}px`
    bottomEl.style.height = `${values.bottom}px`
    bottomEl.style.border = borderStyle
    bottomEl.style.boxSizing = 'border-box'
    bottomEl.style.userSelect = 'none'
    bottomEl.style.pointerEvents = 'none' // 确保盒模型高亮不捕获鼠标事件
    bottomEl.setAttribute(ignoreKey,'true')
    // 添加数值标签
    const bottomLabel = document.createElement('div')
    bottomLabel.className = 'vue-mcp-box-model-label'
    bottomLabel.textContent = `${values.bottom}px`
    bottomLabel.style.position = 'absolute'
    bottomLabel.style.top = '50%'
    bottomLabel.style.left = '50%'
    bottomLabel.style.transform = 'translate(-50%, -50%)'
    bottomLabel.style.backgroundColor = 'white'
    bottomLabel.style.color = textColor
    bottomLabel.style.padding = '1px 4px'
    bottomLabel.style.borderRadius = '2px'
    bottomLabel.style.fontSize = '10px'
    bottomLabel.style.fontWeight = 'bold'
    bottomLabel.style.userSelect = 'none'
    bottomLabel.style.pointerEvents = 'none' // 确保标签不捕获鼠标事件
    bottomLabel.setAttribute(ignoreKey,'true')

    bottomEl.appendChild(bottomLabel)
    container.appendChild(bottomEl)
  }

  // 左侧区域
  if (values.left > 0) {
    const leftEl = document.createElement('div')
    leftEl.className = `vue-mcp-box-model-highlight vue-mcp-${type}-left`
    leftEl.style.position = 'fixed'
    leftEl.style.backgroundColor = color
    leftEl.style.top = `${type === 'padding' ? rect.top : rect.top - values.top}px`
    leftEl.style.left = `${type === 'padding' ? rect.left : rect.left - values.left}px`
    leftEl.style.width = `${values.left}px`
    leftEl.style.height = `${type === 'padding' ? rect.height : rect.height + values.top + values.bottom}px`
    leftEl.style.border = borderStyle
    leftEl.style.boxSizing = 'border-box'
    leftEl.style.userSelect = 'none'
    leftEl.style.pointerEvents = 'none' // 确保盒模型高亮不捕获鼠标事件

    // 添加数值标签
    const leftLabel = document.createElement('div')
    leftLabel.className = 'vue-mcp-box-model-label'
    leftLabel.textContent = `${values.left}px`
    leftLabel.style.position = 'absolute'
    leftLabel.style.top = '50%'
    leftLabel.style.left = '50%'
    leftLabel.style.transform = 'translate(-50%, -50%)'
    leftLabel.style.backgroundColor = 'white'
    leftLabel.style.color = textColor
    leftLabel.style.padding = '1px 4px'
    leftLabel.style.borderRadius = '2px'
    leftLabel.style.fontSize = '10px'
    leftLabel.style.fontWeight = 'bold'
    leftLabel.style.userSelect = 'none'
    leftLabel.style.pointerEvents = 'none' // 确保标签不捕获鼠标事件

    leftEl.appendChild(leftLabel)
    container.appendChild(leftEl)
  }
}

// 隐藏盒模型显示
export function hideBoxModelDisplay(): void {
  const container = document.getElementById('vue-mcp-box-model-container')
  if (container) {
    container.style.display = 'none'
  }
}



// 完全移除盒模型显示（用于清理资源）
export function removeBoxModelDisplay(): void {
  const container = document.getElementById('vue-mcp-box-model-container')
  if (container) {
    container.remove()
  }
}

// 初始化点击跳转组件功能
export function initClickToComponent(): void {
  // 添加样式
  document.head.insertAdjacentHTML(
    'beforeend',
    `
<style type="text/css" key="vue-click-to-component-style">
  [vue-click-to-component] * {
    pointer-events: auto !important;
  }

  [vue-click-to-component-target] {
    cursor: var(--click-to-component-cursor, context-menu) !important;
    outline: 1px auto !important;
  }

  [${ignoreKey}] {
    pointer-events: none !important;
  }

  @supports (outline-color: Highlight) {
    [vue-click-to-component-target] {
      outline: var(--click-to-component-outline, 1px auto Highlight) !important;
    }
  }

  @supports (outline-color: -webkit-focus-ring-color) {
    [vue-click-to-component-target] {
      outline: var(--click-to-component-outline, 1px auto -webkit-focus-ring-color) !important;
    }
  }
</style>`.trim(),
  )

  // 移除Alt+点击跳转，交由FloatingPanel处理
  // 保留鼠标移动时高亮组件的功能
  window.addEventListener(
    'mousemove',
    (e) => {
    
      if (e.altKey) {
        document.body.setAttribute('vue-click-to-component', '')
        if ((e.target as Element).hasAttribute(ignoreKey)) {
          return
        }
        const elWithSourceCodeLocation = getElWithSourceCodeLocation(e.target as Element)

        if (!elWithSourceCodeLocation) {
          return
        }

        setTarget(elWithSourceCodeLocation, 'hover')
      }
      else {
        document.body.removeAttribute('vue-click-to-component')
        cleanTarget()
        hideBoxModelDisplay()
      }
    },
    true,
  )


  // 窗口失焦时清除高亮
  window.addEventListener(
    'blur',
    () => {
      cleanTarget()
      document.body.removeAttribute('vue-click-to-component')
    },
    true,
  )
}
