<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

// 常量
const ignoreKey = 'ai-review-inspect-element-ignore'
const targetElement = ref<HTMLElement | null>(null)

// 计算属性
const elementRect = computed(() => {
  if (!targetElement.value)
    return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }
  return targetElement.value.getBoundingClientRect()
})

const elementComputedStyle = computed(() => {
  if (!targetElement.value)
    return null
  return window.getComputedStyle(targetElement.value)
})

const elementTagName = computed(() => {
  if (!targetElement.value)
    return ''
  const tagName = targetElement.value.tagName.toLowerCase()
  const className = targetElement.value.className ? `.${targetElement.value.className.split(' ').join('.')}` : ''
  return `${tagName}${className}`
})

// Padding 相关计算属性
const paddingValues = computed(() => {
  if (!elementComputedStyle.value)
    return { top: 0, right: 0, bottom: 0, left: 0 }
  return {
    top: Number.parseInt(elementComputedStyle.value.paddingTop, 10) || 0,
    right: Number.parseInt(elementComputedStyle.value.paddingRight, 10) || 0,
    bottom: Number.parseInt(elementComputedStyle.value.paddingBottom, 10) || 0,
    left: Number.parseInt(elementComputedStyle.value.paddingLeft, 10) || 0,
  }
})

const hasPadding = computed(() => {
  const { top, right, bottom, left } = paddingValues.value
  return top > 0 || right > 0 || bottom > 0 || left > 0
})

const paddingColor = computed(() => 'rgba(118, 215, 254, 0.35)')
const paddingTextColor = computed(() => 'rgb(28, 171, 226)')
const paddingBorderStyle = computed(() => '1px dashed rgba(28, 171, 226, 0.8)')

// Margin 相关计算属性
const marginValues = computed(() => {
  if (!elementComputedStyle.value)
    return { top: 0, right: 0, bottom: 0, left: 0 }
  return {
    top: Number.parseInt(elementComputedStyle.value.marginTop, 10) || 0,
    right: Number.parseInt(elementComputedStyle.value.marginRight, 10) || 0,
    bottom: Number.parseInt(elementComputedStyle.value.marginBottom, 10) || 0,
    left: Number.parseInt(elementComputedStyle.value.marginLeft, 10) || 0,
  }
})

const hasMargin = computed(() => {
  const { top, right, bottom, left } = marginValues.value
  return top > 0 || right > 0 || bottom > 0 || left > 0
})

const marginColor = computed(() => 'rgba(246, 178, 107, 0.35)')
const marginTextColor = computed(() => 'rgb(229, 153, 57)')
const marginBorderStyle = computed(() => '1px dashed rgba(229, 153, 57, 0.8)')

// 元素高亮样式
const elementHighlightStyle = computed<any>(() => {
  if (!elementRect.value)
    return {}
  return {
    position: 'fixed',
    top: `${elementRect.value.top}px`,
    left: `${elementRect.value.left}px`,
    width: `${elementRect.value.width}px`,
    height: `${elementRect.value.height}px`,
    backgroundColor: 'rgba(111, 168, 220, 0.25)',
    border: '1px dashed rgba(111, 168, 220, 0.8)',
    boxSizing: 'border-box',
    userSelect: 'none',
    pointerEvents: 'none',
  }
})

// 封装创建盒模型样式的函数
function createBoxModelStyleComputed(type: 'padding' | 'margin', position: 'top' | 'right' | 'bottom' | 'left') {
  return computed<any>(() => {
    if (!elementRect.value)
      return {}

    const values = type === 'padding' ? paddingValues.value : marginValues.value
    const color = type === 'padding' ? paddingColor.value : marginColor.value
    const borderStyle = type === 'padding' ? paddingBorderStyle.value : marginBorderStyle.value

    // 基础样式
    const baseStyle = {
      position: 'fixed',
      backgroundColor: color,
      border: borderStyle,
      boxSizing: 'border-box',
      userSelect: 'none',
      pointerEvents: 'none',
    } as any

    // 根据位置计算特定样式
    switch (position) {
      case 'top':
        return {
          ...baseStyle,
          top: type === 'padding' ? `${elementRect.value.top}px` : `${elementRect.value.top - values.top}px`,
          left: type === 'padding' ? `${elementRect.value.left}px` : `${elementRect.value.left - values.left}px`,
          width: type === 'padding' ? `${elementRect.value.width}px` : `${elementRect.value.width + values.left + values.right}px`,
          height: `${values.top}px`,
        }
      case 'right':
        return {
          ...baseStyle,
          top: type === 'padding' ? `${elementRect.value.top}px` : `${elementRect.value.top - values.top}px`,
          left: type === 'padding' ? `${elementRect.value.right - values.right}px` : `${elementRect.value.right}px`,
          width: `${values.right}px`,
          height: type === 'padding' ? `${elementRect.value.height}px` : `${elementRect.value.height + values.top + values.bottom}px`,
        }
      case 'bottom':
        return {
          ...baseStyle,
          top: type === 'padding' ? `${elementRect.value.bottom - values.bottom}px` : `${elementRect.value.bottom}px`,
          left: type === 'padding' ? `${elementRect.value.left}px` : `${elementRect.value.left - values.left}px`,
          width: type === 'padding' ? `${elementRect.value.width}px` : `${elementRect.value.width + values.left + values.right}px`,
          height: `${values.bottom}px`,
        }
      case 'left':
        return {
          ...baseStyle,
          top: type === 'padding' ? `${elementRect.value.top}px` : `${elementRect.value.top - values.top}px`,
          left: type === 'padding' ? `${elementRect.value.left}px` : `${elementRect.value.left - values.left}px`,
          width: `${values.left}px`,
          height: type === 'padding' ? `${elementRect.value.height}px` : `${elementRect.value.height + values.top + values.bottom}px`,
        }
      default:
        return baseStyle
    }
  })
}

// 使用封装的函数创建样式计算属性
const paddingTopStyle = createBoxModelStyleComputed('padding', 'top')
const paddingRightStyle = createBoxModelStyleComputed('padding', 'right')
const paddingBottomStyle = createBoxModelStyleComputed('padding', 'bottom')
const paddingLeftStyle = createBoxModelStyleComputed('padding', 'left')

const marginTopStyle = createBoxModelStyleComputed('margin', 'top')
const marginRightStyle = createBoxModelStyleComputed('margin', 'right')
const marginBottomStyle = createBoxModelStyleComputed('margin', 'bottom')
const marginLeftStyle = createBoxModelStyleComputed('margin', 'left')

// 设置目标元素的高亮标记
function setTarget(el: Element, type = ''): void {
  if (el.hasAttribute(ignoreKey)) {
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
function cleanTarget(type?: string): void {
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

  // 清除目标元素
  targetElement.value = null
}

// 检查是否应该处理 Alt 点击事件
function checkHandleAltClick(clickEvent: MouseEvent): boolean {
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
function getElWithSourceCodeLocation(el: Element | null): HTMLElement | null {
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
function openEditor(sourceCodeLocation: string, editor = 'cursor'): void {
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
function getElListWithSourceCodeLocation(el: Element | null): HTMLElement[] {
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

function getComponentInfoList(elList: (HTMLElement | Element)[]): ComponentInfo[] {
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

// 显示元素的盒模型（padding/margin）- 更新为使用响应式数据
function showBoxModel(element: HTMLElement): void {
  if (!element)
    return

  // 设置目标元素，触发所有计算属性更新
  targetElement.value = element
}

// 隐藏盒模型显示
function hideBoxModelDisplay(): void {
  targetElement.value = null
}

// 完全移除盒模型显示（用于清理资源）
function removeBoxModelDisplay(): void {
  targetElement.value = null
}

// 初始化点击跳转组件功能
function initClickToComponent(): void {
  // 添加样式
  const styleId = 'vue-click-to-component-style'
  if (!document.getElementById(styleId)) {
    document.head.insertAdjacentHTML(
      'beforeend',
      `
    <style type="text/css" id="${styleId}">
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
  }

  // 监听鼠标移动事件
  const handleMouseMove = (e: MouseEvent) => {
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
  }

  // 监听窗口失焦事件
  const handleWindowBlur = () => {
    cleanTarget()
    document.body.removeAttribute('vue-click-to-component')
  }

  // 添加事件监听器
  window.addEventListener('mousemove', handleMouseMove, true)
  window.addEventListener('blur', handleWindowBlur, true)

  // 组件卸载时移除事件监听器
  onUnmounted(() => {
    window.removeEventListener('mousemove', handleMouseMove, true)
    window.removeEventListener('blur', handleWindowBlur, true)
    removeBoxModelDisplay()
  })
}

// 组件挂载时初始化
onMounted(() => {
  initClickToComponent()
})

// 声明 window 上的全局属性
declare global {
  interface Window {
    __VUE_CLICK_TO_COMPONENT_URL_FUNCTION__?: (options: { sourceCodeLocation: string }) => string | Promise<string>
  }
}

// 导出公共方法供其他组件使用
defineExpose({
  setTarget,
  cleanTarget,
  showBoxModel,
  hideBoxModelDisplay,
  removeBoxModelDisplay,
  openEditor,
  getElWithSourceCodeLocation,
  getElListWithSourceCodeLocation,
  getComponentInfoList,
  checkHandleAltClick,
})
</script>

<template>
  <div>
    <!-- 盒模型浮层容器 -->
    <div
      v-show="targetElement"
      id="vue-mcp-box-model-container"
      class="vue-mcp-container"
      :ai-review-inspect-element-ignore="true"
    >
      <!-- 元素本身高亮 -->
      <div
        class="vue-mcp-box-model-highlight vue-mcp-element"
        :style="elementHighlightStyle"
        :ai-review-inspect-element-ignore="true"
      >
        <!-- 元素信息面板 -->
        <div class="vue-mcp-element-info-panel">
          {{ elementComputedStyle }}
          <div><strong>{{ elementTagName }}</strong></div>
          <div>尺寸: {{ elementRect.width }}px × {{ elementRect.height }}px</div>
          <div>字体: {{ elementComputedStyle?.fontSize }}/{{ elementComputedStyle?.color }}</div>
          <div>背景: {{ elementComputedStyle?.backgroundColor }}</div>
        </div>
      </div>

      <!-- Padding 高亮区域 -->
      <div v-show="hasPadding">
        <!-- 顶部 padding -->
        <div
          v-show="paddingValues.top > 0"
          class="vue-mcp-box-model-highlight vue-mcp-padding-top"
          :style="paddingTopStyle"
          :ai-review-inspect-element-ignore="true"
        >
          <div
            class="vue-mcp-box-model-label"
            :style="{ color: paddingTextColor }"
            :ai-review-inspect-element-ignore="true"
          >
            {{ paddingValues.top }}px
          </div>
        </div>

        <!-- 右侧 padding -->
        <div
          v-show="paddingValues.right > 0"
          class="vue-mcp-box-model-highlight vue-mcp-padding-right"
          :style="paddingRightStyle"
          :ai-review-inspect-element-ignore="true"
        >
          <div
            class="vue-mcp-box-model-label"
            :style="{ color: paddingTextColor }"
            :ai-review-inspect-element-ignore="true"
          >
            {{ paddingValues.right }}px
          </div>
        </div>

        <!-- 底部 padding -->
        <div
          v-show="paddingValues.bottom > 0"
          class="vue-mcp-box-model-highlight vue-mcp-padding-bottom"
          :style="paddingBottomStyle"
          :ai-review-inspect-element-ignore="true"
        >
          <div
            class="vue-mcp-box-model-label"
            :style="{ color: paddingTextColor }"
            :ai-review-inspect-element-ignore="true"
          >
            {{ paddingValues.bottom }}px
          </div>
        </div>

        <!-- 左侧 padding -->
        <div
          v-show="paddingValues.left > 0"
          class="vue-mcp-box-model-highlight vue-mcp-padding-left"
          :style="paddingLeftStyle"
          :ai-review-inspect-element-ignore="true"
        >
          <div
            class="vue-mcp-box-model-label"
            :style="{ color: paddingTextColor }"
            :ai-review-inspect-element-ignore="true"
          >
            {{ paddingValues.left }}px
          </div>
        </div>
      </div>

      <!-- Margin 高亮区域 -->
      <div v-show="hasMargin">
        <!-- 顶部 margin -->
        <div
          v-show="marginValues.top > 0"
          class="vue-mcp-box-model-highlight vue-mcp-margin-top"
          :style="marginTopStyle"
          :ai-review-inspect-element-ignore="true"
        >
          <div
            class="vue-mcp-box-model-label"
            :style="{ color: marginTextColor }"
            :ai-review-inspect-element-ignore="true"
          >
            {{ marginValues.top }}px
          </div>
        </div>

        <!-- 右侧 margin -->
        <div
          v-show="marginValues.right > 0"
          class="vue-mcp-box-model-highlight vue-mcp-margin-right"
          :style="marginRightStyle"
          :ai-review-inspect-element-ignore="true"
        >
          <div
            class="vue-mcp-box-model-label"
            :style="{ color: marginTextColor }"
            :ai-review-inspect-element-ignore="true"
          >
            {{ marginValues.right }}px
          </div>
        </div>

        <!-- 底部 margin -->
        <div
          v-show="marginValues.bottom > 0"
          class="vue-mcp-box-model-highlight vue-mcp-margin-bottom"
          :style="marginBottomStyle"
          :ai-review-inspect-element-ignore="true"
        >
          <div
            class="vue-mcp-box-model-label"
            :style="{ color: marginTextColor }"
            :ai-review-inspect-element-ignore="true"
          >
            {{ marginValues.bottom }}px
          </div>
        </div>

        <!-- 左侧 margin -->
        <div
          v-show="marginValues.left > 0"
          class="vue-mcp-box-model-highlight vue-mcp-margin-left"
          :style="marginLeftStyle"
          :ai-review-inspect-element-ignore="true"
        >
          <div
            class="vue-mcp-box-model-label"
            :style="{ color: marginTextColor }"
            :ai-review-inspect-element-ignore="true"
          >
            {{ marginValues.left }}px
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 盒模型高亮样式 */
.vue-mcp-container {
  position: fixed;
  pointer-events: none;
  z-index: 99999;
  top: 0;
  left: 0;
}

.vue-mcp-box-model-highlight {
  position: fixed;
  box-sizing: border-box;
  user-select: none;
  pointer-events: none;
}

.vue-mcp-box-model-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 10px;
  font-weight: bold;
  user-select: none;
  pointer-events: none;
}

.vue-mcp-element {
  background-color: rgba(111, 168, 220, 0.25);
  border: 1px dashed rgba(111, 168, 220, 0.8);
}

.vue-mcp-element-info-panel {
  position: absolute;
  top: 0;
  right: 0;
  transform: translateY(-100%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-family: monospace;
  white-space: nowrap;
  z-index: 100000;
  user-select: none;
  pointer-events: none;
}
</style>
